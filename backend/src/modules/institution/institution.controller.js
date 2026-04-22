import catchAsync from "../../common/utils/catchAsync.js";
import { sendSuccess } from "../../common/utils/response.js";
import { createInstitution as createInstitutionService } from "./institution.service.js";

export const createInstitution = catchAsync(async (req, res) => {
  const institution = await createInstitutionService(req.body || {});

  return sendSuccess(
    res,
    "Institution created successfully",
    { institution },
    201,
  );
});
