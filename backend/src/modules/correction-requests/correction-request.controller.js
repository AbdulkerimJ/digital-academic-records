import catchAsync from "../../common/utils/catchAsync.js";
import { sendSuccess } from "../../common/utils/response.js";
import {
  submitCorrectionRequestService,
  getStudentCorrectionRequestsService,
  listAllCorrectionRequestsService,
  getCorrectionRequestDetailService,
  approveCorrectionRequestService,
  rejectCorrectionRequestService,
} from "./correction-request.service.js";

// ===================== STUDENT HANDLERS =====================

export const submitRequest = catchAsync(async (req, res) => {
  const { recordId } = req.params;
  const request = await submitCorrectionRequestService({
    studentId: req.user.id,
    recordId,
    ...req.body,
    req,
  });

  return sendSuccess(res, "Correction request submitted successfully", { request }, 201);
});



export const getMyRequests = catchAsync(async (req, res) => {
  const requests = await getStudentCorrectionRequestsService(req.user.id);
  return sendSuccess(res, "Your correction requests fetched successfully", { count: requests.length, requests });
});

export const cancelRequest = catchAsync(async (req, res) => {
  await cancelCorrectionRequestService({
    id: req.params.id,
    studentId: req.user.id,
    req,
  });
  return sendSuccess(res, "Correction request cancelled successfully");
});

// ===================== ADMIN HANDLERS =====================

export const listRequests = catchAsync(async (req, res) => {
  const { status, studentId, institutionId, startDate, endDate, page, limit } = req.query;
  const { requests, totalCount } = await listAllCorrectionRequestsService({
    user: req.user,
    filters: {
      status,
      studentId,
      institutionId,
      startDate,
      endDate,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    },
  });
  return sendSuccess(res, "Correction requests fetched successfully", { count: totalCount, requests });
});

export const getRequestDetail = catchAsync(async (req, res) => {
  const request = await getCorrectionRequestDetailService({
    user: req.user,
    id: req.params.id,
  });
  return sendSuccess(res, "Correction request detail fetched successfully", { request });
});

export const approveRequest = catchAsync(async (req, res) => {
  const request = await approveCorrectionRequestService({
    id: req.params.id,
    user: req.user,
    req,
  });
  return sendSuccess(res, "Correction request approved successfully", { request });
});

export const rejectRequest = catchAsync(async (req, res) => {
  const request = await rejectCorrectionRequestService({
    id: req.params.id,
    ...req.body,
    user: req.user,
    req,
  });

  return sendSuccess(res, "Correction request rejected successfully", { request });
});
