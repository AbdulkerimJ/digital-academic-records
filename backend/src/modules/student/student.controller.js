import catchAsync from "../../common/utils/catchAsync.js";
import { sendSuccess } from "../../common/utils/response.js";
import { createAndSendStudentToken } from "../../common/utils/createAndSendToken.js";
import {
  getStudentProfile,
  requestStudentLogin,
  verifyStudentLogin,
} from "./student.service.js";

export const login = catchAsync(async (req, res) => {
  const result = await requestStudentLogin(req.body || {});

  return sendSuccess(res, result.message);
});

export const verifyLogin = catchAsync(async (req, res) => {
  const user = await verifyStudentLogin(req.body || {});

  return createAndSendStudentToken(user, res);
});

export const getMe = (req, res) => {
  return sendSuccess(
    res,
    "Current user fetched successfully",
    getStudentProfile(req.user),
  );
};
