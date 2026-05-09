import catchAsync from "../../common/utils/catchAsync.js";
import { sendSuccess } from "../../common/utils/response.js";
import {
  REFRESH_COOKIE_NAME,
  clearUserAuthCookie,
  createAndSendUserToken,
} from "../../common/utils/createAndSendToken.js";
import {
  activateInviteService,
  changeUserPasswordService,
  loginUserService,
  refreshUserSessionService,
  revokeUserSessionService,
} from "./auth.service.js";

export const activateInvite = catchAsync(async (req, res) => {
  const activatedUser = await activateInviteService({ ...(req.body || {}), req });

  return createAndSendUserToken(
    activatedUser, 
    res, 
    "Account activated successfully. Welcome!"
  );
});

export const login = catchAsync(async (req, res) => {
  const user = await loginUserService({ ...(req.body || {}), req });

  return createAndSendUserToken(user, res);
});

export const logout = catchAsync(async (req, res) => {
  await revokeUserSessionService({ userId: req.user.id, req });
  clearUserAuthCookie(res);

  return sendSuccess(res, "Logged out successfully");
});

export const refresh = catchAsync(async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
  const user = await refreshUserSessionService({ refreshToken, req });

  return createAndSendUserToken(user, res, "Token refreshed successfully");
});

export const getMe = (req, res) => {
  return sendSuccess(res, "Current user fetched successfully", {
    user: req.user,
  });
};

export const changePassword = catchAsync(async (req, res) => {
  const refreshedUser = await changeUserPasswordService({
    userId: req.user.id,
    ...(req.body || {}),
    req,
  });

  return createAndSendUserToken(
    refreshedUser,
    res,
    "Password changed successfully.",
  );
});
