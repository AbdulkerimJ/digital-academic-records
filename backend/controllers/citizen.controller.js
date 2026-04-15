import catchAsync from "../utils/catchAsync.js";
import { getCitizen } from "../services/fayda.client.js";
import { sendError, sendSuccess } from "../utils/response.js";

const getCitizenByFaydaId = catchAsync(async (req, res) => {
  const { faydaId } = req.params || {};

  if (!faydaId) {
    return sendError(res, "Fayda ID is required", 400);
  }
  
  const citizen = await getCitizen(faydaId);
  sendSuccess(res, citizen);
});

export default getCitizenByFaydaId;
