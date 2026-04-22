import catchAsync from "../../common/utils/catchAsync.js";
import { sendSuccess } from "../../common/utils/response.js";
import {
  clearUserAuthCookie,
  createAndSendUserToken,
} from "../../common/utils/createAndSendToken.js";
import {
  activateInvite as activateInviteService,
  changeUserPassword,
  loginUser,
} from "./auth.service.js";

export const activateInvite = catchAsync(async (req, res) => {
  const activatedUser = await activateInviteService(req.body || {});

  return sendSuccess(res, "Account activated successfully", {
    user: activatedUser,
  });
});

export const login = catchAsync(async (req, res) => {
  const user = await loginUser(req.body || {});

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
  const refreshedUser = await changeUserPassword({
    userId: req.user.id,
    ...(req.body || {}),
  });

  return createAndSendUserToken(
    refreshedUser,
    res,
    "Password changed successfully.",
  );
});
