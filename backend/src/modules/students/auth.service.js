import AppError from "../../common/utils/appError.js";
import jwt from "jsonwebtoken";
import { getCitizen, sendOtp, verifyOtp } from "../citizens/fayda.client.js";
import {
  createStudentFromCitizen,
  findStudentByNationalId,
  incrementStudentTokenVersionById,
} from "./student.repository.js";

// add comments in the below service function to explain the code
export const requestStudentLoginService = async ({ faydaId }) => {
  // check if faydaId is provided
  if (!faydaId) {
    throw new AppError("faydaId is required", 400);
  }

  // Check if student is already registered in our database
  const student = await findStudentByNationalId(faydaId);
  if (!student) {
    throw new AppError(
      "You are not registered in our system. Please contact your institution.",
      403,
    );
  }

  // get citizen from fayda service
  const citizenRes = await getCitizen(faydaId);

  // check if citizen is found
  if (!citizenRes.success) {
    throw new AppError(citizenRes.message || "Citizen not found in the national system", 404);
  }


  // Send OTP only if the student is registered
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

  const user = await findStudentByNationalId(faydaId);

  if (!user) {
    throw new AppError("Student record not found.", 404);
  }

  return user;
};

export const getStudentAuthContextService = async (decoded) => {
  if (!decoded?.nationalId) {
    throw new AppError("Invalid token payload", 401);
  }

  const currentStudent = await findStudentByNationalId(decoded.nationalId);

  if (!currentStudent) {
    throw new AppError(
      "The user belonging to this token no longer exists.",
      401,
    );
  }

  if (decoded.tokenVersion !== currentStudent.tokenVersion) {
    throw new AppError("Session is no longer valid. Please log in again.", 401);
  }

  return currentStudent;
};

export const refreshStudentSessionService = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError("Refresh token is required", 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.STUDENT_REFRESH_SECRET);
  } catch {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  if (!decoded.nationalId) {
    throw new AppError("Invalid refresh token payload", 401);
  }

  return getStudentAuthContextService(decoded);
};

export const revokeStudentSessionService = async (studentId) => {
  if (!studentId) {
    throw new AppError("studentId is required", 400);
  }

  const updated = await incrementStudentTokenVersionById(studentId);

  if (!updated) {
    throw new AppError("User not found", 404);
  }

  return updated;
};
