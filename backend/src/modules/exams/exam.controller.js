import catchAsync from "../../common/utils/catchAsync.js";
import AppError from "../../common/utils/appError.js";
import { sendSuccess } from "../../common/utils/response.js";
import {
  createExamLevelService,
  listExamLevelsService,
  updateExamLevelService,
  createExamRecordService,
  listExamRecordsService,
  getExamRecordByIdService,
  updateExamRecordService,
  deleteExamRecordService,
  getExamLevelByIdService,
  uploadBulkExamsService,
} from "./exam.service.js";

//Super admin only functions
export const createExamLevel = catchAsync(async (req, res) => {
  const examLevel = await createExamLevelService(req.body || {});
  return sendSuccess(res, "Exam level created successfully", { examLevel }, 201);
});

export const updateExamLevel = catchAsync(async (req, res) => {
  const examLevel = await updateExamLevelService({
    examLevelId: req.params.examLevelId,
    ...(req.body || {}),
  });
  return sendSuccess(res, "Exam level updated successfully", { examLevel });
});


export const getExamLevelById = catchAsync(async (req, res) => {
  const { examLevelId } = req.params;
  const examLevel = await getExamLevelByIdService({ examLevelId });

  return sendSuccess(res, "Exam level fetched successfully", { examLevel });
});

// User functions
export const listExamLevels = catchAsync(async (req, res) => {
  const examLevels = await listExamLevelsService();
  return sendSuccess(res, "Exam levels fetched successfully", {
    count: examLevels.length,
    examLevels,
  });
});

export const createExamRecord = catchAsync(async (req, res) => {
  const examRecord = await createExamRecordService({
    user: req.user,
    data: req.body || {},
  });

  return sendSuccess(
    res,
    "Exam record created successfully",
    { examRecord },
    201,
  );
});

export const listExamRecords = catchAsync(async (req, res) => {
  const { examRecords, count } = await listExamRecordsService({
    user: req.user,
    filters: {
      examLevelCode: req.query.examLevelCode,
      year: req.query.year,
      search: req.query.search,
    },
    pagination: {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
    },
  });

  return sendSuccess(res, "Exam records fetched successfully", {
    examRecords,
    count,
  });
});

export const getExamRecordById = catchAsync(async (req, res) => {
  const examRecord = await getExamRecordByIdService({
    user: req.user,
    examId: req.params.examId,
  });
  return sendSuccess(res, "Exam record fetched successfully", { examRecord });
});

export const updateExamRecord = catchAsync(async (req, res) => {
  const examRecord = await updateExamRecordService({
    user: req.user,
    examId: req.params.examId,
    ...(req.body || {}),
  });
  return sendSuccess(res, "Exam record updated successfully", { examRecord });
});


export const deleteExamRecord = catchAsync(async (req, res) => {
  await deleteExamRecordService({
    user: req.user,
    examId: req.params.examId,
  });

  return sendSuccess(res, "Exam record deleted successfully");
});

export const uploadBulkExams = catchAsync(async (req, res) => {
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
    const results = await uploadBulkExamsService({
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
