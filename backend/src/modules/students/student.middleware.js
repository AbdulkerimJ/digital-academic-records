import jwt from "jsonwebtoken";
import AppError from "../../common/utils/appError.js";
import catchAsync from "../../common/utils/catchAsync.js";
import getTokenFromRequest from "../../common/utils/getTokenFromRequest.js";
import { getStudentAuthContextService } from "./auth.service.js";

export const protectStudent = catchAsync(async (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    throw new AppError(
      "You are not logged in. Please log in to get access.",
      401,
    );
  }

  const decoded = jwt.verify(token, process.env.STUDENT_ACCESS_SECRET);
  const currentStudent = await getStudentAuthContextService(decoded);

  req.user = {
    ...currentStudent
  };

  next();
});
