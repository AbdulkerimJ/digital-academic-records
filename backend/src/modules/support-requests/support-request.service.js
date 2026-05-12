import {
  createSupportRequestRecord,
  findSupportRequests,
  findSupportRequestById,
  updateSupportResponseRecord
} from "./support-request.repository.js";
import AppError from "../../common/utils/appError.js";
import { logActionService } from "../audit/audit.service.js";
import { sendSupportEmailResponse } from "../../common/utils/email.js";

export const createSupportRequestService = async (data, req) => {
  if (!data.email || !data.message || !data.subject) {
    throw new AppError("Email, subject, and message are required", 400);
  }

  const request = await createSupportRequestRecord({
    email: data.email,
    subject: data.subject,
    message: data.message
  });



  return request;
};

export const getAllSupportRequestsService = async (filters) => {
  return await findSupportRequests(filters);
};

export const respondToSupportRequestService = async (id, { response }, user, req) => {
  if (!response || response.trim().length === 0) {
    throw new AppError("Response cannot be empty", 400);
  }

  const request = await findSupportRequestById(id);
  if (!request) {
    throw new AppError("Support request not found", 404);
  }

  // Update record in database
  const updatedRequest = await updateSupportResponseRecord(id, { 
    response, 
    status: 'RESOLVED' 
  });

  // Send email to the requester
  try {
    await sendSupportEmailResponse({
      to: request.email,
      subject: request.subject,
      message: request.message,
      response: response
    });
  } catch (err) {
    console.error("Failed to send support email notification:", err);
    // We don't throw here to avoid breaking the DB update, but it's logged
  }

  await logActionService({
    user,
    action: "RESPOND_TO_SUPPORT",
    entityType: "SUPPORT_REQUEST",
    entityId: id,
    newValues: updatedRequest,
    req
  });

  return updatedRequest;
};
