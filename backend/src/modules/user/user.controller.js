import catchAsync from "../../common/utils/catchAsync.js";
import { sendSuccess } from "../../common/utils/response.js";
import {
  deleteUser,
  inviteUser,
  listUsers,
  resendInvite as resendInviteService,
  revokeInvite as revokeInviteService,
  updateUser,
} from "./user.service.js";

export const create = catchAsync(async (req, res) => {
  const result = await inviteUser(req.body || {});

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
  const users = await listUsers();

  return sendSuccess(res, "Users fetched successfully", { users });
});

export const update = catchAsync(async (req, res) => {
  const user = await updateUser({
    userId: req.params.userId,
    ...(req.body || {}),
  });

  return sendSuccess(res, "User updated successfully", { user });
});

export const remove = catchAsync(async (req, res) => {
  const user = await deleteUser({ userId: req.params.userId });

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
