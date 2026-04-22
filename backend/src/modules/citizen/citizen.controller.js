import catchAsync from "../../common/utils/catchAsync.js";
import { sendSuccess } from "../../common/utils/response.js";
import { getCitizenProfileByFaydaIdService } from "./citizen.service.js";

const getCitizenByFaydaId = catchAsync(async (req, res) => {
  const citizen = await getCitizenProfileByFaydaIdService(req.params || {});
  sendSuccess(res, "Citizen fetched successfully", citizen);
});

export default getCitizenByFaydaId;
