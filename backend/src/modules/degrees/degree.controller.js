import catchAsync from "../../common/utils/catchAsync.js";
import { sendSuccess } from "../../common/utils/response.js";
import {
  listDegreeLevelsService,
  getDegreeLevelByIdService,
  createDegreeLevelService,
  updateDegreeLevelService,
  listDegreeTitlesService,
  getDegreeTitleByIdService,
  createDegreeTitleService,
  updateDegreeTitleService,
  createDegreeService,
  listDegreesService,
  getDegreeByIdService,
  updateDegreeService,
  deleteDegreeService,
} from "./degree.service.js";

// ===================== DEGREE LEVEL LOOKUPS =====================

export const listDegreeLevels = catchAsync(async (req, res) => {
  const degreeLevels = await listDegreeLevelsService();
  return sendSuccess(res, "Degree levels fetched successfully", {
    count: degreeLevels.length,
    degreeLevels,
  });
});

export const getDegreeLevelById = catchAsync(async (req, res) => {
  const { degreeLevelId } = req.params;
  const degreeLevel = await getDegreeLevelByIdService({ degreeLevelId });

  return sendSuccess(res, "Degree level fetched successfully", { degreeLevel });
});


export const createDegreeLevel = catchAsync(async (req, res) => {
  const degreeLevel = await createDegreeLevelService({
    user: req.user,
    data: req.body,
  });
  return sendSuccess(res, "Degree level created successfully", { degreeLevel }, 201);
});

export const updateDegreeLevel = catchAsync(async (req, res) => {
  const { degreeLevelId } = req.params;
  const degreeLevel = await updateDegreeLevelService({
    user: req.user,
    id: degreeLevelId,
    data: req.body,
  });
  return sendSuccess(res, "Degree level updated successfully", { degreeLevel });
});


// ===================== DEGREE TITLE LOOKUPS =====================

export const listDegreeTitles = catchAsync(async (req, res) => {
  const degreeTitles = await listDegreeTitlesService({
    degreeLevelId: req.query.degreeLevelId,
  });
  return sendSuccess(res, "Degree titles fetched successfully", {
    count: degreeTitles.length,
    degreeTitles,
  });
});

export const getDegreeTitleById = catchAsync(async (req, res) => {
  const { degreeTitleId } = req.params;
  const degreeTitle = await getDegreeTitleByIdService({ degreeTitleId });

  return sendSuccess(res, "Degree title fetched successfully", { degreeTitle });
});


export const createDegreeTitle = catchAsync(async (req, res) => {
  const degreeTitle = await createDegreeTitleService({
    user: req.user,
    data: req.body,
  });
  return sendSuccess(res, "Degree title created successfully", { degreeTitle }, 201);
});

export const updateDegreeTitle = catchAsync(async (req, res) => {
  const { degreeTitleId } = req.params;
  const degreeTitle = await updateDegreeTitleService({
    user: req.user,
    id: degreeTitleId,
    data: req.body,
  });
  return sendSuccess(res, "Degree title updated successfully", { degreeTitle });
});


// ===================== DEGREE RECORD CRUD =====================

export const createDegree = catchAsync(async (req, res) => {
  const degree = await createDegreeService({
    user: req.user,
    data: req.body || {},
  });

  return sendSuccess(
    res,
    "Degree record created successfully",
    { degree },
    201,
  );
});

export const listDegrees = catchAsync(async (req, res) => {
  const degrees = await listDegreesService({
    user: req.user,
    filters: {
      degreeLevelCode: req.query.degreeLevelCode,
      graduationYear: req.query.graduationYear,
      studentId: req.query.studentId,
    },
    pagination: {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
    },
  });

  return sendSuccess(res, "Degree records fetched successfully", {
    degrees,
  });
});

export const getDegreeById = catchAsync(async (req, res) => {
  const degree = await getDegreeByIdService({
    user: req.user,
    degreeId: req.params.degreeId,
  });
  return sendSuccess(res, "Degree record fetched successfully", { degree });
});

export const updateDegree = catchAsync(async (req, res) => {
  const degree = await updateDegreeService({
    user: req.user,
    degreeId: req.params.degreeId,
    ...req.body,
  });
  return sendSuccess(res, "Degree record updated successfully", { degree });
});

export const deleteDegree = catchAsync(async (req, res) => {
  await deleteDegreeService({
    user: req.user,
    degreeId: req.params.degreeId,
  });

  return sendSuccess(res, "Degree record deleted successfully");
});



