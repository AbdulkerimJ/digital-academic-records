import catchAsync from "../../common/utils/catchAsync.js";
import { sendSuccess } from "../../common/utils/response.js";
import { listAuditLogsService } from "./audit.service.js";

export const listAuditLogs = catchAsync(async (req, res) => {
  const { 
    page, 
    limit, 
    userId, 
    institutionId, 
    entityType, 
    action 
  } = req.query;

  const result = await listAuditLogsService({
    user: req.user,
    filters: {
      userId,
      institutionId,
      entityType,
      action,
    },
    pagination: {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    },
  });

  return sendSuccess(res, "Audit logs fetched successfully", result);
});
