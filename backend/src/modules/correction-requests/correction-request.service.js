import AppError from "../../common/utils/appError.js";
import {
  createCorrectionRequestRecord,
  findCorrectionRequestsByStudentId,
  findCorrectionRequests,
  findCorrectionRequestById,
  updateCorrectionRequestStatus,
  deleteCorrectionRequestsByRecord,
  deleteCorrectionRequestById,
} from "./correction-request.repository.js";


import { findExamRecordById } from "../exams/exam.repository.js";
import { findDegreeById } from "../degrees/degree.repository.js";



// ===================== STUDENT ACTIONS =====================

export const submitCorrectionRequestService = async ({ studentId, recordId, recordType, requestText }) => {
  if (!requestText) {
    throw new AppError("Request text is required.", 400);
  }

  if (!recordId || !recordType) {
    throw new AppError("Record ID and Record Type are required to submit a correction.", 400);
  }

  let derivedInstitutionId;


  // 1. Validate record and automatically fetch institutionId
  let record;
  if (recordType === "EXAM") {
    record = await findExamRecordById(recordId);
  } else if (recordType === "DEGREE") {
    record = await findDegreeById(recordId);
  } else {
    throw new AppError("Invalid record type. Must be EXAM or DEGREE.", 400);
  }

  if (!record) {
    throw new AppError(`${recordType} record not found.`, 404);
  }

  if (record.studentId !== studentId) {
    throw new AppError("You can only request corrections for your own records.", 403);
  }

  // Use the institution from the record
  derivedInstitutionId = record.institutionId;

  if (!derivedInstitutionId) {
    throw new AppError("Could not determine the institution for this record.", 400);
  }

  // 2. Cleanup: Delete only PENDING requests for this record
  // (APPROVED and REJECTED requests are kept as history)
  await deleteCorrectionRequestsByRecord({
    studentId,
    recordId,
    recordType,
    statuses: ["PENDING"],
  });



  return await createCorrectionRequestRecord({
    studentId,
    institutionId: derivedInstitutionId,
    requestText: requestText.trim(),
    recordId,
    recordType,
  });
};



export const getStudentCorrectionRequestsService = async (studentId) => {
  return await findCorrectionRequestsByStudentId(studentId);
};

// ===================== ADMIN ACTIONS =====================

export const listAllCorrectionRequestsService = async ({ user, filters }) => {
  const queryFilters = { ...filters };

  if (user.roleName !== "SUPER_ADMIN") {
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

  if (user.roleName !== "SUPER_ADMIN") {
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

  if (user.roleName !== "SUPER_ADMIN") {
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

  if (user.roleName !== "SUPER_ADMIN") {
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
