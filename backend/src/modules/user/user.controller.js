import catchAsync from "../../common/utils/catchAsync.js";
import { sendSuccess } from "../../common/utils/response.js";
import {
  deleteUserService,
  getUserByIdService,
  inviteUserService,
  listUsersService,
  resendInviteService,
  revokeInviteService,
  suspendUserService,
  unsuspendUserService,
  updateMyProfileService,
  updateUserService,
} from "./user.service.js";

export const create = catchAsync(async (req, res) => {
  const result = await inviteUserService(req.body || {});

  console.log(
    `[Invitation Link - simulated] email=${result.user.email} inviteLink=${result.inviteLink} expiresAt=${result.invitationExpires.toISOString()}`,
  );

  return sendSuccess(
    res,
    "User invited successfully. Invitation link sent to email.",
    { user: result.user },
    201,
  );
});

export const list = catchAsync(async (req, res) => {
  const users = await listUsersService({ requesterUserId: req.user.id });

  return sendSuccess(res, "Users fetched successfully", {
    count: users.length,
    users,
  });
});

export const getUserById = catchAsync(async (req, res) => {
  const user = await getUserByIdService({ userId: req.params.userId });

  return sendSuccess(res, "User fetched successfully", { user });
});

export const update = catchAsync(async (req, res) => {
  const user = await updateUserService({
    userId: req.params.userId,
    ...(req.body || {}),
  });

  return sendSuccess(res, "User updated successfully", { user });
});

export const updateMe = catchAsync(async (req, res) => {
  const { firstName, lastName } = req.body || {};

  const user = await updateMyProfileService({
    userId: req.user.id,
    firstName,
    lastName,
  });

  return sendSuccess(res, "Profile updated successfully", { user });
});

export const remove = catchAsync(async (req, res) => {
  const user = await deleteUserService({ userId: req.params.userId });

  return sendSuccess(res, "User deleted successfully", { user });
});

export const revokeInvite = catchAsync(async (req, res) => {
  const updatedUser = await revokeInviteService(req.params || {});

  return sendSuccess(res, "Invitation revoked successfully", {
    user: updatedUser,
  });
});

export const resendInvite = catchAsync(async (req, res) => {
  const result = await resendInviteService(req.params || {});

  console.log(
    `[Invitation Link - simulated] email=${result.user.email} inviteLink=${result.inviteLink} expiresAt=${result.invitationExpires.toISOString()}`,
  );

  return sendSuccess(res, "Invitation resent successfully", {
    user: result.user,
  });
});

export const suspend = catchAsync(async (req, res) => {
  const user = await suspendUserService({
    userId: req.params.userId,
    requesterUserId: req.user.id,
    reason: req.body?.reason,
  });

  return sendSuccess(res, "User suspended successfully", { user });
});

export const unsuspend = catchAsync(async (req, res) => {
  const user = await unsuspendUserService({
    userId: req.params.userId,
    requesterUserId: req.user.id,
  });

  return sendSuccess(res, "User unsuspended successfully", { user });
});
