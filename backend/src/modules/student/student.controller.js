import catchAsync from "../../common/utils/catchAsync.js";
import { sendSuccess } from "../../common/utils/response.js";
import { createAndSendStudentToken } from "../../common/utils/createAndSendToken.js";
import {
  getStudentProfileService,
  requestStudentLoginService,
  verifyStudentLoginService,
} from "./student.service.js";

export const login = catchAsync(async (req, res) => {
  const result = await requestStudentLoginService(req.body || {});

  return sendSuccess(res, result.message);
});

export const verifyLogin = catchAsync(async (req, res) => {
  const user = await verifyStudentLoginService(req.body || {});

  return createAndSendStudentToken(user, res);
});

export const getMe = (req, res) => {
  return sendSuccess(
    res,
    "Current user fetched successfully",
    getStudentProfileService(req.user),
  );
};
