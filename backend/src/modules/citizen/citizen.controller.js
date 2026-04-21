import catchAsync from "../../common/utils/catchAsync.js";
import { getCitizen } from "./fayda.client.js";
import { sendError, sendSuccess } from "../../common/utils/response.js";

const getCitizenByFaydaId = catchAsync(async (req, res) => {
  const { faydaId } = req.params || {};

  if (!faydaId) {
    return sendError(res, "Fayda ID is required", 400);
  }

  const citizen = await getCitizen(faydaId);
  sendSuccess(res, "Citizen fetched successfully", citizen);
});

export default getCitizenByFaydaId;
