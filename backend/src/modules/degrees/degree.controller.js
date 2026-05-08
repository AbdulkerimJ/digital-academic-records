import catchAsync from "../../common/utils/catchAsync.js";
import AppError from "../../common/utils/appError.js";
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
  uploadBulkDegreesService,
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
    data: req.body || {},
  });
  return sendSuccess(res, "Degree level created successfully", { degreeLevel }, 201);
});


export const updateDegreeLevel = catchAsync(async (req, res) => {
  const { degreeLevelId } = req.params;
  const degreeLevel = await updateDegreeLevelService({
    user: req.user,
    id: degreeLevelId,
    data: req.body || {},
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
    data: req.body || {},
  });
  return sendSuccess(res, "Degree title created successfully", { degreeTitle }, 201);
});


export const updateDegreeTitle = catchAsync(async (req, res) => {
  const { degreeTitleId } = req.params;
  const degreeTitle = await updateDegreeTitleService({
    user: req.user,
    id: degreeTitleId,
    data: req.body || {},
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
    { degreeRecord: degree },
    201,
  );
});

export const listDegrees = catchAsync(async (req, res) => {
  const { degrees, count } = await listDegreesService({
    user: req.user,
    filters: {
      degreeLevelCode: req.query.degreeLevelCode,
      graduationYear: req.query.graduationYear,
      search: req.query.search,
    },
    pagination: {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
    },
  });

  return sendSuccess(res, "Degree records fetched successfully", {
    degrees,
    count,
  });
});

export const getDegreeById = catchAsync(async (req, res) => {
  const degreeRecord = await getDegreeByIdService({
    user: req.user,
    degreeId: req.params.degreeId,
  });
  return sendSuccess(res, "Degree record fetched successfully", { degreeRecord });
});

export const updateDegree = catchAsync(async (req, res) => {
  const degreeRecord = await updateDegreeService({
    user: req.user,
    degreeId: req.params.degreeId,
    ...(req.body || {}),
  });
  return sendSuccess(res, "Degree record updated successfully", { degreeRecord });
});


export const deleteDegree = catchAsync(async (req, res) => {
  await deleteDegreeService({
    user: req.user,
    degreeId: req.params.degreeId,
  });

  return sendSuccess(res, "Degree record deleted successfully");
});

export const uploadBulkDegrees = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new AppError("No file provided. Please upload a CSV file.", 400);
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const onProgress = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const results = await uploadBulkDegreesService({
      user: req.user,
      fileBuffer: req.file.buffer,
      onProgress,
      institutionId: (req.body || {}).institutionId || req.query.institutionId,
      institutionCode: (req.body || {}).institutionCode || req.query.institutionCode,
    });


    res.write(`data: ${JSON.stringify({ complete: true, results })}\n\n`);
    res.end();
  } catch (err) {
    res.write(
      `data: ${JSON.stringify({
        error: err.message || "Internal server error during processing",
      })}\n\n`,
    );
    res.end();
  }
});



