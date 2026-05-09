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
  findUserByEmailAll,
  restoreUserById,
} from "./user.repository.js";
import { sendInvitationEmail } from "../../common/services/email.service.js";
import { logActionService } from "../audit/audit.service.js";

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
  user: actor,
  req,
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

  const allUser = await findUserByEmailAll(normalizedEmail);
  if (allUser && !allUser.isDeleted) {
    throw new AppError("User already exists with this email", 400);
  }

  const { token: invitationToken, expiresAt: invitationExpires } =
    buildInvitation();
  const inviteLink = getInviteLink(invitationToken);

  let user;
  if (allUser && allUser.isDeleted) {
    // RESTORE logic
    await restoreUserById(allUser.id);
    user = await updateUserById({
      id: allUser.id,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      roleId: numericRoleId,
      institutionId: finalInstitutionId,
      invitationToken,
      invitationExpires,
      isActive: false, // reset to inactive for new invite
    });

    await logActionService({
      user: actor,
      action: "RESTORE_USER",
      entityType: "USER",
      entityId: allUser.id,
      newValues: user,
      req,
    });
  } else {
    // Normal CREATE logic
    user = await createUserRecord({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      roleId: numericRoleId,
      institutionId: finalInstitutionId,
      invitationToken,
      invitationExpires,
    });

    await logActionService({
      user: actor,
      action: "INVITE_USER",
      entityType: "USER",
      entityId: user.id,
      newValues: user,
      req,
    });
  }

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
  user: actor,
  req,
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

  await logActionService({
    user: actor,
    action: "UPDATE_USER",
    entityType: "USER",
    entityId: userId,
    oldValues: currentUser,
    newValues: updatedUser,
    req,
  });

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
  req,
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

  await logActionService({
    user: updatedUser,
    action: "UPDATE_PROFILE",
    entityType: "USER",
    entityId: userId,
    oldValues: currentUser,
    newValues: updatedUser,
    req,
  });

  return updatedUser;
};

export const deleteUserService = async ({ userId, user: actor, req }) => {
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

  await logActionService({
    user: actor,
    action: "DELETE_USER",
    entityType: "USER",
    entityId: userId,
    oldValues: currentUser,
    req,
  });

  return deletedUser;
};

export const revokeInviteService = async ({ userId, user: actor, req }) => {
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

  const updated = await revokeInvitationByUserId(userId);
  
  await logActionService({
    user: actor,
    action: "REVOKE_INVITE",
    entityType: "USER",
    entityId: userId,
    req,
  });

  return updated;
};

export const resendInviteService = async ({ userId, user: actor, req }) => {
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

  await logActionService({
    user: actor,
    action: "RESEND_INVITE",
    entityType: "USER",
    entityId: userId,
    req,
  });

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
  user: actor,
  req,
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

  const suspended = await suspendUserById({
    id: userId,
    suspendedBy: requesterUserId,
    suspensionReason,
  });

  await logActionService({
    user: actor,
    action: "SUSPEND_USER",
    entityType: "USER",
    entityId: userId,
    oldValues: user,
    newValues: { isSuspended: true, suspensionReason },
    req,
  });

  return suspended;
};

export const unsuspendUserService = async ({ userId, requesterUserId, user: actor, req }) => {
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

  const unsuspended = await unsuspendUserById({ id: userId });

  await logActionService({
    user: actor,
    action: "UNSUSPEND_USER",
    entityType: "USER",
    entityId: userId,
    oldValues: user,
    newValues: { isSuspended: false },
    req,
  });

  return unsuspended;
};
