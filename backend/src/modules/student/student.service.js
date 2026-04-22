import AppError from "../../common/utils/appError.js";
import { getCitizen, sendOtp, verifyOtp } from "../citizen/fayda.client.js";
import {
  createStudentFromCitizen,
  findStudentByNationalId,
} from "./student.repository.js";

export const requestStudentLoginService = async ({ faydaId }) => {
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

  return { message: "OTP sent successfully" };
};

export const verifyStudentLoginService = async ({ faydaId, otp }) => {
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

  return user;
};

export const getStudentProfileService = (user) => ({ user });
