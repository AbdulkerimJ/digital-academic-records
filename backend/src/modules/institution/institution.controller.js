import catchAsync from "../../common/utils/catchAsync.js";
import { sendSuccess } from "../../common/utils/response.js";
import {
  createInstitutionService,
  getInstitutionByIdService,
  listInstitutionsService,
  updateInstitutionService,
} from "./institution.service.js";

export const createInstitution = catchAsync(async (req, res) => {
  const institution = await createInstitutionService(req.body || {});

  return sendSuccess(
    res,
    "Institution created successfully",
    { institution },
    201,
  );
});

export const listInstitutions = catchAsync(async (req, res) => {
  const institutions = await listInstitutionsService();

  return sendSuccess(res, "Institutions fetched successfully", {
    count: institutions.length,
    institutions,
  });
});

export const getInstitutionById = catchAsync(async (req, res) => {
  const institution = await getInstitutionByIdService({
    institutionId: req.params.institutionId,
  });

  return sendSuccess(res, "Institution fetched successfully", {
    institution,
  });
});

export const updateInstitution = catchAsync(async (req, res) => {
  const institution = await updateInstitutionService({
    institutionId: req.params.institutionId,
    ...(req.body || {}),
  });

  return sendSuccess(res, "Institution updated successfully", {
    institution,
  });
});
