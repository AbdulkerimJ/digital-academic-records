import catchAsync from "../../common/utils/catchAsync.js";
import AppError from "../../common/utils/appError.js";
import { sendSuccess } from "../../common/utils/response.js";
import {
  clearUserAuthCookie,
  createAndSendUserToken,
} from "../../common/utils/createAndSendToken.js";
import {
  createUserRecord,
  findUserByEmail,
  findUserByEmailWithRole,
  findUserByIdWithRole,
  getRoleById,
  updateUserById,
  verifyUserEmailById,
} from "./user.repository.js";
import generateOtp from "../../common/utils/generateOtp.js";
import { comparePassword, hashPassword } from "../../common/utils/password.js";

export const create = catchAsync(async (req, res) => {
  const { firstName, lastName, email, password, roleId, institutionId } =
    req.body || {};

  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    roleId === undefined ||
    roleId === null ||
    roleId === "" ||
    institutionId === undefined ||
    institutionId === null ||
    institutionId === ""
  ) {
    throw new AppError(
      "firstName, lastName, email, password, roleId and institutionId are required",
      400,
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  const numericRoleId = Number(roleId);

  if (!Number.isInteger(numericRoleId) || numericRoleId <= 0) {
    throw new AppError("roleId must be a positive integer", 400);
  }

  const isRoleExists = await getRoleById(numericRoleId);
  if (!isRoleExists) {
    throw new AppError("role does not exist", 400);
  }

  if (password.length < 8) {
    throw new AppError("password must be at least 8 characters long", 400);
  }

  const existingUser = await findUserByEmail(normalizedEmail);
  if (existingUser) {
    throw new AppError("User already exists with this email", 400);
  }

  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
  const passwordHash = await hashPassword(password);
  const user = await createUserRecord({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: normalizedEmail,
    passwordHash,
    roleId: numericRoleId,
    institutionId,
    emailOtp: otp,
    emailOtpExpires: otpExpiresAt,
  });

  console.log(
    `[Email OTP - simulated] email=${normalizedEmail} otp=${otp} expiresAt=${otpExpiresAt.toISOString()}`,
  );

  return sendSuccess(
    res,
    "User created successfully. Verification OTP sent to email.",
    { user },
    201,
  );
});

export const verifyEmail = catchAsync(async (req, res) => {
  const { email, otp } = req.body || {};

  if (!email || !otp) {
    throw new AppError("email and otp are required", 400);
  }
  if (!/^\d{6}$/.test(String(otp))) {
    throw new AppError("OTP must be a 6-digit code", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.isVerified) {
    return sendSuccess(res, "Email is already verified", {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        roleId: user.roleId,
        institutionId: user.institutionId,
        isVerified: user.isVerified,
      },
    });
  }

  if (!user.emailOtp || !user.emailOtpExpires) {
    throw new AppError("No email verification OTP found for this user", 400);
  }

  if (user.emailOtp !== String(otp)) {
    throw new AppError("Invalid OTP", 400);
  }

  if (user.emailOtpExpires < new Date()) {
    throw new AppError("OTP has expired", 400);
  }

  const verifiedUser = await verifyUserEmailById(user.id);

  return sendSuccess(res, "Email verified successfully", {
    user: verifiedUser,
  });
});

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    throw new AppError("email and password are required", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await findUserByEmailWithRole(normalizedEmail);

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isMatch = await comparePassword(password, user.passwordHash);

  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  return createAndSendUserToken(user, res);
});

export const logout = (req, res) => {
  clearUserAuthCookie(res);

  return sendSuccess(res, "Logged out successfully");
};

export const getMe = (req, res) => {
  return sendSuccess(res, "Current user fetched successfully", {
    user: req.user,
  });
};

export const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};

  if (!currentPassword || !newPassword) {
    throw new AppError("Current password and new password are required", 400);
  }

  if (newPassword.length < 8) {
    throw new AppError("New password must be at least 8 characters long", 400);
  }

  if (currentPassword === newPassword) {
    throw new AppError(
      "New password must be different from current password",
      400,
    );
  }

  const currentUser = await findUserByIdWithRole(req.user.id);

  if (!currentUser) {
    throw new AppError("User not found", 404);
  }

  const isCurrentPasswordValid = await comparePassword(
    currentPassword,
    currentUser.passwordHash,
  );

  if (!isCurrentPasswordValid) {
    throw new AppError("Current password is incorrect", 401);
  }

  const newPasswordHash = await hashPassword(newPassword);

  await updateUserById({
    id: req.user.id,
    passwordHash: newPasswordHash,
  });

  const refreshedUser = await findUserByIdWithRole(req.user.id);

  if (!refreshedUser) {
    throw new AppError("User not found after password change", 404);
  }

  return createAndSendUserToken(
    refreshedUser,
    res,
    "Password changed successfully.",
  );
});
