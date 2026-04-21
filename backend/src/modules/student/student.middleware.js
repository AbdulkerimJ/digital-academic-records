import jwt from "jsonwebtoken";
import AppError from "../../common/utils/appError.js";
import catchAsync from "../../common/utils/catchAsync.js";
import getTokenFromRequest from "../../common/utils/getTokenFromRequest.js";
import { findStudentByNationalId } from "./student.repository.js";

export const protectStudent = catchAsync(async (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    throw new AppError(
      "You are not logged in. Please log in to get access.",
      401,
    );
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const tokenNationalId = decoded.nationalId;

  if (!tokenNationalId) {
    throw new AppError("Invalid token payload", 401);
  }

  const currentStudent = await findStudentByNationalId(tokenNationalId);

  if (!currentStudent) {
    throw new AppError(
      "The user belonging to this token no longer exists.",
      401,
    );
  }

  req.user = {
    id: currentStudent.id,
    firstName: currentStudent.firstName,
    lastName: currentStudent.lastName,
    nationalId: currentStudent.nationalId,
  };

  next();
});
