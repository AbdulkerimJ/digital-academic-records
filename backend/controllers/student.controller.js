import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import { sendSuccess } from "../utils/response.js";
import { createAndSendStudentToken } from "../utils/createAndSendToken.js";
import { getCitizen, sendOtp, verifyOtp } from "../services/fayda.client.js";
import {
  createStudentFromCitizen,
  findStudentByNationalId,
} from "../repositories/student.repository.js";

export const login = catchAsync(async (req, res) => {
  const { faydaId } = req.body || {};

  if (!faydaId) {
    throw new AppError("faydaId is required", 400);
  }

  const citizenRes = await getCitizen(faydaId);

  if (!citizenRes.success) {
    throw new AppError("Citizen not found", 404);
  }

  const otpRes = await sendOtp(faydaId);

  if (!otpRes.success) {
    throw new AppError(otpRes.message || "Failed to send OTP", 400);
  }

  return sendSuccess(res, "OTP sent successfully");
});

export const verifyLogin = catchAsync(async (req, res) => {
  const { faydaId, otp } = req.body || {};

  if (!faydaId || !otp) {
    throw new AppError("faydaId and otp are required", 400);
  }

  const result = await verifyOtp(faydaId, otp);

  if (!result.success) {
    throw new AppError(result.message || "OTP verification failed", 400);
  }

  let user = await findStudentByNationalId(faydaId);

  if (!user) {
    const citizenRes = await getCitizen(faydaId);

    if (!citizenRes.success) {
      throw new AppError(citizenRes.message || "Citizen not found", 404);
    }

    user = await createStudentFromCitizen(faydaId, citizenRes.data);
  }

  return createAndSendStudentToken(user, res);
});

export const getMe = (req, res) => {
  return sendSuccess(res, "Current user fetched successfully", {
    user: req.user,
  });
};
