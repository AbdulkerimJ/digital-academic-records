import catchAsync from "../../common/utils/catchAsync.js";
import { sendSuccess } from "../../common/utils/response.js";
import {
  REFRESH_COOKIE_NAME,
  clearStudentAuthCookie,
  createAndSendStudentToken,
} from "../../common/utils/createAndSendToken.js";
import { getStudentProfileService } from "./student.service.js";
import {
  refreshStudentSessionService,
  revokeStudentSessionService,
  requestStudentLoginService,
  verifyStudentLoginService,
} from "./auth.service.js";

export const login = catchAsync(async (req, res) => {
  const result = await requestStudentLoginService(req.body || {});

  return sendSuccess(res, result.message);
});

export const verifyLogin = catchAsync(async (req, res) => {
  const user = await verifyStudentLoginService(req.body || {});

  return createAndSendStudentToken(user, res);
});

export const refresh = catchAsync(async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
  const user = await refreshStudentSessionService(refreshToken);

  return createAndSendStudentToken(user, res);
});

export const logout = catchAsync(async (req, res) => {
  await revokeStudentSessionService(req.user.id);
  clearStudentAuthCookie(res);

  return sendSuccess(res, "Logged out successfully");
});

export const getMe = (req, res) => {
  return sendSuccess(
    res,
    "Current user fetched successfully",
    getStudentProfileService(req.user),
  );
};
