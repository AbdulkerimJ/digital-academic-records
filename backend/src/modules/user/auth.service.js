import AppError from "../../common/utils/appError.js";
import jwt from "jsonwebtoken";
import { hashPassword, comparePassword } from "../../common/utils/password.js";
import {
  activateUserByInvitationToken,
  findUserByEmailWithRole,
  findUserByInvitationToken,
  findUserByIdWithRole,
  incrementUserTokenVersionById,
  updateUserById,
} from "./user.repository.js";

export const activateInviteService = async ({ token, password }) => {
  if (!token || !password) {
    throw new AppError("token and password are required", 400);
  }

  if (password.length < 8) {
    throw new AppError("Password must be at least 8 characters long.", 400);
  }

  const invitationToken = String(token).trim();
  const existingUser = await findUserByInvitationToken(invitationToken);

  if (!existingUser) {
    throw new AppError("Invalid invitation token", 400);
  }

  if (existingUser.isActive) {
    throw new AppError("Account is already active", 400);
  }

  if (!existingUser.invitationExpires) {
    throw new AppError("Invitation has been revoked or already used", 400);
  }

  if (existingUser.invitationExpires < new Date()) {
    throw new AppError("Invitation link has expired", 400);
  }

  const passwordHash = await hashPassword(password);
  const activatedUser = await activateUserByInvitationToken({
    invitationToken,
    passwordHash,
  });

  if (!activatedUser) {
    throw new AppError("Failed to activate account", 500);
  }

  return activatedUser;
};

export const loginUserService = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError("email and password are required", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await findUserByEmailWithRole(normalizedEmail);

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isActive) {
    throw new AppError(
      "Account is not active. Please activate your invite.",
      403,
    );
  }

  if (user.isSuspended) {
    throw new AppError("Account is suspended. Please contact support.", 403);
  }

  const isMatch = await comparePassword(password, user.passwordHash);

  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  return user;
};

export const getUserAuthContextService = async (decoded) => {
  if (!decoded?.id) {
    throw new AppError("Invalid token payload", 401);
  }

  const user = await findUserByIdWithRole(decoded.id);

  if (!user) {
    throw new AppError(
      "The user belonging to this token no longer exists.",
      401,
    );
  }

  if (!user.isActive) {
    throw new AppError("Account is not active. Please contact support.", 403);
  }

  if (user.isSuspended) {
    throw new AppError("Account is suspended. Please contact support.", 403);
  }

  if (decoded.tokenVersion !== user.tokenVersion) {
    throw new AppError("Session is no longer valid. Please log in again.", 401);
  }

  if (user.passwordChangedAt && decoded.iat) {
    const passwordChangedTimestamp =
      new Date(user.passwordChangedAt).getTime() / 1000;

    if (decoded.iat < passwordChangedTimestamp) {
      throw new AppError(
        "User recently changed password. Please log in again.",
        401,
      );
    }
  }

  return user;
};

export const refreshUserSessionService = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError("Refresh token is required", 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
  } catch {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  if (decoded.nationalId) {
    throw new AppError("Invalid refresh token payload", 401);
  }

  const user = await findUserByIdWithRole(decoded.id);

  if (!user) {
    throw new AppError(
      "The user belonging to this token no longer exists.",
      401,
    );
  }

  if (!user.isActive) {
    throw new AppError("Account is not active", 403);
  }

  if (user.isSuspended) {
    throw new AppError("Account is suspended. Please contact support.", 403);
  }

  if (decoded.tokenVersion !== user.tokenVersion) {
    throw new AppError("Session is no longer valid. Please log in again.", 401);
  }

  return user;
};

export const revokeUserSessionService = async (userId) => {
  if (!userId) {
    throw new AppError("userId is required", 400);
  }

  const updated = await incrementUserTokenVersionById(userId);

  if (!updated) {
    throw new AppError("User not found", 404);
  }

  return updated;
};

export const changeUserPasswordService = async ({
  userId,
  currentPassword,
  newPassword,
}) => {
  if (!currentPassword || !newPassword) {
    throw new AppError("Current password and new password are required", 400);
  }

  if (newPassword.length < 8) {
    throw new AppError("Password must be at least 8 characters long.", 400);
  }

  if (currentPassword === newPassword) {
    throw new AppError(
      "New password must be different from current password",
      400,
    );
  }

  const currentUser = await findUserByIdWithRole(userId);

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
    id: userId,
    passwordHash: newPasswordHash,
  });

  const refreshedUser = await findUserByIdWithRole(userId);

  if (!refreshedUser) {
    throw new AppError("User not found after password change", 404);
  }

  return refreshedUser;
};
