import AppError from "../../common/utils/appError.js";
import {
  createCorrectionRequestRecord,
  findCorrectionRequestsByStudentId,
  findCorrectionRequests,
  findCorrectionRequestById,
  updateCorrectionRequestStatus,
} from "./correction-request.repository.js";

// ===================== STUDENT ACTIONS =====================

export const submitCorrectionRequestService = async ({ studentId, institutionId, requestText }) => {
  if (!requestText || !institutionId) {
    throw new AppError("Request text and institution ID are required.", 400);
  }

  return await createCorrectionRequestRecord({
    studentId,
    institutionId,
    requestText: requestText.trim(),
  });
};

export const getStudentCorrectionRequestsService = async (studentId) => {
  return await findCorrectionRequestsByStudentId(studentId);
};

// ===================== ADMIN ACTIONS =====================

export const listAllCorrectionRequestsService = async ({ user, filters }) => {
  const queryFilters = { ...filters };

  if (user.role !== "SUPER_ADMIN") {
    if (!user.institutionId) {
      throw new AppError("Institution context missing for user.", 400);
    }
    queryFilters.institutionId = user.institutionId;
  }

  return await findCorrectionRequests(queryFilters);
};

export const getCorrectionRequestDetailService = async ({ user, id }) => {
  const request = await findCorrectionRequestById(id);
  if (!request) {
    throw new AppError("Correction request not found.", 404);
  }

  if (user.role !== "SUPER_ADMIN") {
    if (request.institutionId !== user.institutionId) {
      throw new AppError("You do not have permission to access this request.", 403);
    }
  }

  return request;
};

export const approveCorrectionRequestService = async ({ id, user }) => {
  const request = await findCorrectionRequestById(id);
  if (!request) {
    throw new AppError("Correction request not found.", 404);
  }

  if (user.role !== "SUPER_ADMIN") {
    if (request.institutionId !== user.institutionId) {
      throw new AppError("You do not have permission to approve this request.", 403);
    }
  }

  if (request.status !== "PENDING") {
    throw new AppError(`Cannot approve a request that is already ${request.status}.`, 400);
  }

  return await updateCorrectionRequestStatus({
    id,
    status: "APPROVED",
    reviewedBy: user.id,
  });
};

export const rejectCorrectionRequestService = async ({ id, user, reason }) => {
  if (!reason) {
    throw new AppError("Rejection reason is required.", 400);
  }

  const request = await findCorrectionRequestById(id);
  if (!request) {
    throw new AppError("Correction request not found.", 404);
  }

  if (user.role !== "SUPER_ADMIN") {
    if (request.institutionId !== user.institutionId) {
      throw new AppError("You do not have permission to reject this request.", 403);
    }
  }

  if (request.status !== "PENDING") {
    throw new AppError(`Cannot reject a request that is already ${request.status}.`, 400);
  }

  return await updateCorrectionRequestStatus({
    id,
    status: "REJECTED",
    reviewedBy: user.id,
    rejectionReason: reason.trim(),
  });
};

