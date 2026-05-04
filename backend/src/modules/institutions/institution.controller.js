import catchAsync from "../../common/utils/catchAsync.js";
import { sendSuccess } from "../../common/utils/response.js";
import {
  createInstitutionService,
  getInstitutionByIdService,
  listInstitutionsService,
  updateInstitutionService,
  getInstitutionTypesService,
} from "./institution.service.js";

export const getInstitutionTypes = catchAsync(async (req, res) => {
  const types = await getInstitutionTypesService();

  return sendSuccess(res, "Institution types fetched successfully", {
    types,
  });
});

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
  const { 
    limit, 
    offset, 
    search, 
    type, 
    status, 
    sortBy, 
    sortDir 
  } = req.query;

  const institutions = await listInstitutionsService({
    limit: limit ? parseInt(limit, 10) : 10,
    offset: offset ? parseInt(offset, 10) : 0,
    search,
    type,
    status,
    sortBy,
    sortDir
  });

  const totalCount = institutions.length > 0 ? parseInt(institutions[0].totalCount, 10) : 0;

  return sendSuccess(res, "Institutions fetched successfully", {
    count: institutions.length,
    totalCount,
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
