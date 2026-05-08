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
import { sendInvitationEmail } from "../../common/services/email.service.js";

const INVITATION_TOKEN_TTL_HOURS = parseInt(process.env.INVITATION_TOKEN_TTL_HOURS || "24", 10);
const INVITATION_TOKEN_TTL_MS = INVITATION_TOKEN_TTL_HOURS * 60 * 60 * 1000;

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
  if (!firstName || !lastName || !email || roleId === undefined || roleId === null || roleId === "") {
    throw new AppError("firstName, lastName, email, and roleId are required", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const numericRoleId = Number(roleId);

  if (!Number.isInteger(numericRoleId) || numericRoleId <= 0) {
    throw new AppError("roleId must be a positive integer", 400);
  }

  // There is only one Super Admin (ID 1). Invitations are only for Registrars.
  if (numericRoleId === 1) {
    throw new AppError("Creating additional Super Admins is not allowed.", 403);
  }

  const finalInstitutionId = institutionId;

  if (!finalInstitutionId || finalInstitutionId === "") {
    throw new AppError("Institution is required for the Registrar role.", 400);
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
    institutionId: finalInstitutionId,
    invitationToken,
    invitationExpires,
  });

  let emailSent = false;
  try {
    await sendInvitationEmail({
      to: normalizedEmail,
      firstName: firstName.trim(),
      inviteLink,
    });
    emailSent = true;
  } catch (err) {
    console.error("Invitation email sending failed:", err);
    // We don't throw here because the user record IS created successfully.
    // Instead, we let the caller know it failed.
  }

  return {
    user,
    invitationToken,
    invitationExpires,
    inviteLink,
    emailSent,
  };
};

export const listUsersService = async ({ 
  requesterUserId,
  limit,
  offset,
  sortBy,
  sortDir,
  search,
  role,
  status,
  institutionId
} = {}) => {
  return findUsersWithRole({ 
    excludeUserId: requesterUserId,
    limit,
    offset,
    sortBy,
    sortDir,
    search,
    role,
    status,
    institutionId
  });
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
  institutionId,
}) => {
  if (!userId) {
    throw new AppError("userId is required", 400);
  }

  const currentUser = await findUserByIdWithRole(userId);
  if (!currentUser) {
    throw new AppError("User not found", 404);
  }

  // normalize inputs
  const trimmedFirstName =
    firstName !== undefined ? String(firstName).trim() : undefined;

  const trimmedLastName =
    lastName !== undefined ? String(lastName).trim() : undefined;

  const normalizedEmail =
    email !== undefined ? String(email).trim().toLowerCase() : undefined;

  const nextInstitutionId =
    institutionId !== undefined && institutionId !== null && institutionId !== ""
      ? institutionId
      : undefined;

  // email uniqueness check
  if (normalizedEmail !== undefined) {
    const emailOwner = await findUserByEmail(normalizedEmail);
    if (emailOwner && emailOwner.id !== userId) {
      throw new AppError("User already exists with this email", 400);
    }
  }

  // resolve final institution to respect DB constraint
  const isSuperAdmin = currentUser.roleId === 1;
  let finalInstitutionId = nextInstitutionId !== undefined ? nextInstitutionId : currentUser.institutionId;

  if (isSuperAdmin) {
    finalInstitutionId = null;
  } else if (!finalInstitutionId) {
    throw new AppError("Institution is required for this role", 400);
  }

  // Handle invitation regeneration if email changes for a pending user
  let invitationToken = undefined;
  let invitationExpires = undefined;
  let inviteLink = undefined;

  const emailIsChanging = normalizedEmail !== undefined && normalizedEmail !== currentUser.email;

  if (emailIsChanging && !currentUser.isActive) {
    const newInvitation = buildInvitation();
    invitationToken = newInvitation.token;
    invitationExpires = newInvitation.expiresAt;
    inviteLink = getInviteLink(invitationToken);
  }

  const updatedUser = await updateUserById({
    id: userId,
    firstName: trimmedFirstName,
    lastName: trimmedLastName,
    email: normalizedEmail,
    institutionId: finalInstitutionId,
    invitationToken,
    invitationExpires,
  });

  if (!updatedUser) {
    throw new AppError("Failed to update user", 500);
  }

  if (inviteLink) {
    sendInvitationEmail({
      to: normalizedEmail || currentUser.email,
      firstName: trimmedFirstName || currentUser.firstName,
      inviteLink,
    }).catch((err) => console.error("Background email sending failed:", err));
  }

  return {
    user: updatedUser,
    inviteLink,
    invitationExpires,
  };
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
      400
    );
  }

  const nextFirstName = hasFirstName
    ? String(firstName).trim()
    : undefined;

  const nextLastName = hasLastName
    ? String(lastName).trim()
    : undefined;

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

  let emailSent = false;
  try {
    await sendInvitationEmail({
      to: user.email,
      firstName: user.firstName,
      inviteLink,
    });
    emailSent = true;
  } catch (err) {
    console.error("Resend invitation email sending failed:", err);
  }

  return {
    user: updatedUser,
    inviteLink,
    invitationExpires,
    emailSent,
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
