import {
  createSupportRequestService,
  getAllSupportRequestsService,
  respondToSupportRequestService
} from "./support-request.service.js";
import catchAsync from "../../common/utils/catchAsync.js";

export const createRequest = catchAsync(async (req, res) => {
  const request = await createSupportRequestService(req.body, req);

  res.status(201).json({
    status: "success",
    data: { request }
  });
});

export const getAllRequests = catchAsync(async (req, res) => {
  const requests = await getAllSupportRequestsService(req.query);

  res.status(200).json({
    status: "success",
    results: requests.length,
    data: { requests }
  });
});

export const respondToRequest = catchAsync(async (req, res) => {
  const request = await respondToSupportRequestService(req.params.id, req.body, req.user, req);

  res.status(200).json({
    status: "success",
    data: { request }
  });
});
