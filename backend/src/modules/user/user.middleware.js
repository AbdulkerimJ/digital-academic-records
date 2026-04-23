import jwt from "jsonwebtoken";
import AppError from "../../common/utils/appError.js";
import catchAsync from "../../common/utils/catchAsync.js";
import getTokenFromRequest from "../../common/utils/getTokenFromRequest.js";
import { getUserAuthContextService } from "./auth.service.js";

export const protectUser = catchAsync(async (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    throw new AppError(
      "You are not logged in. Please log in to get access.",
      401,
    );
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const currentUser = await getUserAuthContextService(decoded);

  req.user = {
    id: currentUser.id,
    firstName: currentUser.firstName,
    lastName: currentUser.lastName,
    email: currentUser.email,
    role: currentUser.roleName,
    roleId: currentUser.roleId,
    institutionId: currentUser.institutionId,
    tokenVersion: currentUser.tokenVersion,
    passwordChangedAt: currentUser.passwordChangedAt,
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
