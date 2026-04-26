import catchAsync from "../../common/utils/catchAsync.js";
import { sendSuccess } from "../../common/utils/response.js";
import {
  createExamTypeService,
  listExamTypesService,
  updateExamTypeService,
  createExamRecordService,
  listExamRecordsService,
  getExamRecordByIdService,
  updateExamRecordService,
  deleteExamRecordService,
  getExamTypeByIdService,
} from "./exam.service.js";

//Super admin only functions
export const createExamType = catchAsync(async (req, res) => {
  const examType = await createExamTypeService(req.body || {});
  return sendSuccess(res, "Exam type created successfully", { examType }, 201);
});

export const updateExamType = catchAsync(async (req, res) => {
  const examType = await updateExamTypeService({
    examTypeId: req.params.examTypeId,
    ...req.body,
  });
  return sendSuccess(res, "Exam type updated successfully", { examType });
});

export const getExamTypeById = catchAsync(async (req, res) => {
  const { examTypeId } = req.params;
  const examType = await getExamTypeByIdService({ examTypeId });

  return sendSuccess(res, "Exam type fetched successfully", { examType });
});

// User functions
export const listExamTypes = catchAsync(async (req, res) => {
  const examTypes = await listExamTypesService();
  return sendSuccess(res, "Exam types fetched successfully", {
    count: examTypes.length,
    examTypes,
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
  const examRecords = await listExamRecordsService({
    user: req.user,
    filters: {
      examTypeCode: req.query.examTypeCode,
      year: req.query.year,
      studentId: req.query.studentId,
    },
    pagination: {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
    },
  });

  return sendSuccess(res, "Exam records fetched successfully", {
    examRecords,
  });
});

export const getExamRecordById = catchAsync(async (req, res) => {
  const examRecord = await getExamRecordByIdService({
    examId: req.params.examId,
  });
  return sendSuccess(res, "Exam record fetched successfully", { examRecord });
});

export const updateExamRecord = catchAsync(async (req, res) => {
  const examRecord = await updateExamRecordService({
    examId: req.params.examId,
    ...req.body,
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
