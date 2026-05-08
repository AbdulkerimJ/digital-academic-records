import catchAsync from "../../common/utils/catchAsync.js";
import { sendSuccess } from "../../common/utils/response.js";
import { getDashboardStatsService } from "./dashboard.service.js";

export const getDashboardStats = catchAsync(async (req, res) => {
  const data = await getDashboardStatsService(req.user);
  return sendSuccess(res, "Dashboard stats fetched successfully", data);
});
