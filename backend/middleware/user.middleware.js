import jwt from "jsonwebtoken";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import getTokenFromRequest from "../utils/getTokenFromRequest.js";
import { findUserByIdWithRole } from "../repositories/user.repository.js";

export const protectUser = catchAsync(async (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    throw new AppError(
      "You are not logged in. Please log in to get access.",
      401,
    );
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (decoded.nationalId) {
    throw new AppError("Invalid token payload", 401);
  }

  const currentUser = await findUserByIdWithRole(decoded.id);

  if (!currentUser) {
    throw new AppError(
      "The user belonging to this token no longer exists.",
      401,
    );
  }

  req.user = {
    id: currentUser.id,
    firstName: currentUser.firstName,
    lastName: currentUser.lastName,
    email: currentUser.email,
    role: currentUser.roleName,
    roleId: currentUser.roleId,
    institutionId: currentUser.institutionId,
  };

  next();
});

export const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      throw new AppError(
        "You do not have permission to perform this action.",
        403,
      );
    }

    next();
  };
};
