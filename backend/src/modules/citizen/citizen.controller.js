import catchAsync from "../../common/utils/catchAsync.js";
import { sendSuccess } from "../../common/utils/response.js";
import { getCitizenProfileByFaydaId } from "./citizen.service.js";

const getCitizenByFaydaId = catchAsync(async (req, res) => {
  const citizen = await getCitizenProfileByFaydaId(req.params || {});
  sendSuccess(res, "Citizen fetched successfully", citizen);
});

export default getCitizenByFaydaId;
