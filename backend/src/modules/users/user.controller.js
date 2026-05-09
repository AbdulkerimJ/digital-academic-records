import catchAsync from "../../common/utils/catchAsync.js";
import { sendSuccess } from "../../common/utils/response.js";
import {
  deleteUserService,
  getUserByIdService,
  inviteUserService,
  listRolesService,
  listUsersService,
  resendInviteService,
  revokeInviteService,
  suspendUserService,
  unsuspendUserService,
  updateMyProfileService,
  updateUserService,
} from "./user.service.js";

export const create = catchAsync(async (req, res) => {
  const result = await inviteUserService({ 
    ...req.body, 
    user: req.user, 
    req 
  });

  console.log(
    `[Invitation Link - simulated] email=${result.user.email} inviteLink=${result.inviteLink} expiresAt=${result.invitationExpires.toISOString()}`,
  );

  return sendSuccess(
    res,
    result.emailSent 
      ? "User invited successfully. Invitation link sent to email."
      : "User created, but the invitation email failed to send.",
    { 
      user: result.user,
      emailSent: result.emailSent
    },
    201,
  );
});

export const list = catchAsync(async (req, res) => {
  const { 
    limit, 
    offset, 
    sortBy, 
    sortDir, 
    search, 
    role, 
    status, 
    institutionId 
  } = req.query;

  const users = await listUsersService({ 
    requesterUserId: req.user.id,
    limit: limit ? parseInt(limit, 10) : 10,
    offset: offset ? parseInt(offset, 10) : 0,
    sortBy: sortBy || 'createdAt',
    sortDir: sortDir || 'DESC',
    search,
    role,
    status,
    institutionId
  });

  const totalCount = users.length > 0 ? parseInt(users[0].totalCount, 10) : 0;

  return sendSuccess(res, "Users fetched successfully", {
    count: users.length,
    totalCount,
    users,
  });
});

export const listRoles = catchAsync(async (req, res) => {
  const roles = await listRolesService();

  return sendSuccess(res, "Roles fetched successfully", {
    count: roles.length,
    roles,
  });
});

export const getUserById = catchAsync(async (req, res) => {
  const user = await getUserByIdService({ userId: req.params.userId });

  return sendSuccess(res, "User fetched successfully", { user });
});

export const update = catchAsync(async (req, res) => {
  const result = await updateUserService({
    userId: req.params.userId,
    ...req.body,
    user: req.user,
    req,
  });

  if (result.inviteLink) {
    console.log(
      `[Invitation Link - updated/simulated] email=${result.user.email} inviteLink=${result.inviteLink} expiresAt=${result.invitationExpires.toISOString()}`,
    );
  }

  return sendSuccess(res, "User updated successfully", { user: result.user });
});

export const updateMe = catchAsync(async (req, res) => {
  const user = await updateMyProfileService({
    userId: req.user.id,
    ...req.body,
    req,
  });

  return sendSuccess(res, "Profile updated successfully", { user });
});

export const remove = catchAsync(async (req, res) => {
  const user = await deleteUserService({ userId: req.params.userId, user: req.user, req });

  return sendSuccess(res, "User deleted successfully", { user });
});

export const revokeInvite = catchAsync(async (req, res) => {
  const updatedUser = await revokeInviteService({ 
    userId: req.params.userId, 
    user: req.user, 
    req 
  });

  return sendSuccess(res, "Invitation revoked successfully", {
    user: updatedUser,
  });
});

export const resendInvite = catchAsync(async (req, res) => {
  const result = await resendInviteService({ 
    userId: req.params.userId, 
    user: req.user, 
    req 
  });

  console.log(
    `[Invitation Link - simulated] email=${result.user.email} inviteLink=${result.inviteLink} expiresAt=${result.invitationExpires.toISOString()}`,
  );

  return sendSuccess(res, "Invitation resent successfully", {
    user: result.user,
    emailSent: result.emailSent
  });
});

export const suspend = catchAsync(async (req, res) => {
  const user = await suspendUserService({
    userId: req.params.userId,
    requesterUserId: req.user.id,
    reason: req.body?.reason,
    user: req.user,
    req,
  });

  return sendSuccess(res, "User suspended successfully", { user });
});

export const unsuspend = catchAsync(async (req, res) => {
  const user = await unsuspendUserService({
    userId: req.params.userId,
    requesterUserId: req.user.id,
    user: req.user,
    req,
  });

  return sendSuccess(res, "User unsuspended successfully", { user });
});
