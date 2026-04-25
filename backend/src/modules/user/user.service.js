import { randomBytes } from "crypto";

import AppError from "../../common/utils/appError.js";
import {
  createUserRecord,
  deleteUserById,
  findUserByEmail,
  findUserByIdWithRole,
  findRoles,
  findUsersWithRole,
  getRoleById,
  replaceInvitationByUserId,
  revokeInvitationByUserId,
  suspendUserById,
  unsuspendUserById,
  updateUserById,
} from "./user.repository.js";

const INVITATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

const buildInvitation = () => {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + INVITATION_TOKEN_TTL_MS);
  return { token, expiresAt };
};

const getInviteLink = (token) => {
  const appBaseUrl = (
    process.env.APP_BASE_URL || "http://localhost:4000"
  ).replace(/\/$/, "");

  return `${appBaseUrl}/activate-account?token=${token}`;
};

export const inviteUserService = async ({
  firstName,
  lastName,
  email,
  roleId,
  institutionId,
}) => {
  if (
    !firstName ||
    !lastName ||
    !email ||
    roleId === undefined ||
    roleId === null ||
    roleId === "" ||
    institutionId === undefined ||
    institutionId === null ||
    institutionId === ""
  ) {
    throw new AppError(
      "firstName, lastName, email, roleId and institutionId are required",
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

  const existingUser = await findUserByEmail(normalizedEmail);
  if (existingUser) {
    throw new AppError("User already exists with this email", 400);
  }

  const { token: invitationToken, expiresAt: invitationExpires } =
    buildInvitation();
  const inviteLink = getInviteLink(invitationToken);

  const user = await createUserRecord({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: normalizedEmail,
    roleId: numericRoleId,
    institutionId,
    invitationToken,
    invitationExpires,
  });

  return {
    user,
    invitationToken,
    invitationExpires,
    inviteLink,
  };
};

export const listUsersService = async ({ requesterUserId } = {}) => {
  return findUsersWithRole({ excludeUserId: requesterUserId });
};

export const listRolesService = async () => {
  return findRoles();
};

export const getUserByIdService = async ({ userId }) => {
  if (!userId) {
    throw new AppError("userId is required", 400);
  }

  const user = await findUserByIdWithRole(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const {
    id,
    firstName,
    lastName,
    email,
    isActive,
    isSuspended,
    suspendedAt,
    suspensionReason,
    suspenderId,
    suspenderFirstName,
    suspenderLastName,
    suspenderEmail,
    roleId,
    roleName,
    institutionId,
    createdAt,
    updatedAt,
  } = user;
  return {
    id,
    firstName,
    lastName,
    email,
    isActive,
    isSuspended,
    suspendedAt,
    suspensionReason,
    suspender: suspenderId
      ? {
          id: suspenderId,
          firstName: suspenderFirstName,
          lastName: suspenderLastName,
          email: suspenderEmail,
        }
      : null,
    roleId,
    roleName,
    institutionId,
    createdAt,
    updatedAt,
  };
};

export const updateUserService = async ({
  userId,
  firstName,
  lastName,
  email,
  roleId,
  institutionId,
}) => {
  if (!userId) {
    throw new AppError("userId is required", 400);
  }

  const currentUser = await findUserByIdWithRole(userId);
  if (!currentUser) {
    throw new AppError("User not found", 404);
  }

  const trimmedFirstName = firstName?.trim();
  const trimmedLastName = lastName?.trim();
  const normalizedEmail = email?.trim().toLowerCase();
  const numericRoleId =
    roleId === undefined || roleId === null || roleId === ""
      ? null
      : Number(roleId);
  const nextInstitutionId =
    institutionId === undefined ||
    institutionId === null ||
    institutionId === ""
      ? null
      : institutionId;

  if (
    numericRoleId !== null &&
    (!Number.isInteger(numericRoleId) || numericRoleId <= 0)
  ) {
    throw new AppError("roleId must be a positive integer", 400);
  }

  if (numericRoleId !== null) {
    const isRoleExists = await getRoleById(numericRoleId);
    if (!isRoleExists) {
      throw new AppError("role does not exist", 400);
    }
  }

  if (normalizedEmail) {
    const emailOwner = await findUserByEmail(normalizedEmail);
    if (emailOwner && emailOwner.id !== userId) {
      throw new AppError("User already exists with this email", 400);
    }
  }

  if (
    trimmedFirstName === null &&
    trimmedLastName === null &&
    normalizedEmail === null &&
    numericRoleId === null &&
    nextInstitutionId === null
  ) {
    throw new AppError(
      "At least one field is required to update the user",
      400,
    );
  }

  const updatedUser = await updateUserById({
    id: userId,
    firstName: trimmedFirstName,
    lastName: trimmedLastName,
    email: normalizedEmail,
    roleId: numericRoleId,
    institutionId: nextInstitutionId,
  });

  if (!updatedUser) {
    throw new AppError("Failed to update user", 500);
  }

  return updatedUser;
};

export const updateMyProfileService = async ({
  userId,
  firstName,
  lastName,
}) => {
  if (!userId) {
    throw new AppError("userId is required", 400);
  }

  const currentUser = await findUserByIdWithRole(userId);
  if (!currentUser) {
    throw new AppError("User not found", 404);
  }

  const hasFirstName = firstName !== undefined;
  const hasLastName = lastName !== undefined;

  if (!hasFirstName && !hasLastName) {
    throw new AppError(
      "At least one field is required to update your profile",
      400,
    );
  }

  const nextFirstName = hasFirstName ? String(firstName).trim() : null;
  const nextLastName = hasLastName ? String(lastName).trim() : null;

  if (hasFirstName && !nextFirstName) {
    throw new AppError("firstName cannot be empty", 400);
  }

  if (hasLastName && !nextLastName) {
    throw new AppError("lastName cannot be empty", 400);
  }

  const updatedUser = await updateUserById({
    id: userId,
    firstName: nextFirstName,
    lastName: nextLastName,
  });

  if (!updatedUser) {
    throw new AppError("Failed to update profile", 500);
  }

  return updatedUser;
};

export const deleteUserService = async ({ userId }) => {
  if (!userId) {
    throw new AppError("userId is required", 400);
  }

  const currentUser = await findUserByIdWithRole(userId);
  if (!currentUser) {
    throw new AppError("User not found", 404);
  }

  const deletedUser = await deleteUserById(userId);
  if (!deletedUser) {
    throw new AppError("Failed to delete user", 500);
  }

  return deletedUser;
};

export const revokeInviteService = async ({ userId }) => {
  if (!userId) {
    throw new AppError("userId is required", 400);
  }

  const user = await findUserByIdWithRole(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.isActive) {
    throw new AppError("Cannot revoke invite for an active user", 400);
  }

  return revokeInvitationByUserId(userId);
};

export const resendInviteService = async ({ userId }) => {
  if (!userId) {
    throw new AppError("userId is required", 400);
  }

  const user = await findUserByIdWithRole(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.isActive) {
    throw new AppError("Cannot resend invite for an active user", 400);
  }

  const { token: invitationToken, expiresAt: invitationExpires } =
    buildInvitation();

  const updatedUser = await replaceInvitationByUserId({
    id: userId,
    invitationToken,
    invitationExpires,
  });
  const inviteLink = getInviteLink(invitationToken);

  return {
    user: updatedUser,
    inviteLink,
    invitationExpires,
  };
};

export const suspendUserService = async ({
  userId,
  requesterUserId,
  reason,
}) => {
  if (!userId) {
    throw new AppError("userId is required", 400);
  }

  if (!requesterUserId) {
    throw new AppError("requesterUserId is required", 400);
  }

  if (userId === requesterUserId) {
    throw new AppError("You cannot suspend your own account", 400);
  }

  const user = await findUserByIdWithRole(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.roleName === "SUPER_ADMIN") {
    throw new AppError("Suspending SUPER_ADMIN is not allowed", 403);
  }

  if (user.isSuspended) {
    throw new AppError("User is already suspended", 400);
  }

  const suspensionReason =
    reason === undefined || reason === null ? null : String(reason).trim();

  return suspendUserById({
    id: userId,
    suspendedBy: requesterUserId,
    suspensionReason,
  });
};

export const unsuspendUserService = async ({ userId, requesterUserId }) => {
  if (!userId) {
    throw new AppError("userId is required", 400);
  }

  if (!requesterUserId) {
    throw new AppError("requesterUserId is required", 400);
  }

  const user = await findUserByIdWithRole(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.isSuspended) {
    throw new AppError("User is not suspended", 400);
  }

  return unsuspendUserById({ id: userId });
};
