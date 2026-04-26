import catchAsync from "../../common/utils/catchAsync.js";
import { sendSuccess } from "../../common/utils/response.js";
import {
  createExamTypeService,
  listExamTypesService,
  updateExamTypeService,
  createExamRecordService,
  listExamRecordsService,
  listExamRecordsByTypeService,
  getExamRecordByIdService,
  updateExamRecordService,
} from "./exam.service.js";

export const createExamType = catchAsync(async (req, res) => {
  const examType = await createExamTypeService(req.body || {});
  return sendSuccess(res, "Exam type created successfully", { examType }, 201);
});

export const listExamTypes = catchAsync(async (req, res) => {
  const examTypes = await listExamTypesService();
  return sendSuccess(res, "Exam types fetched successfully", {
    count: examTypes.length,
    examTypes,
  });
});

export const updateExamType = catchAsync(async (req, res) => {
  const examType = await updateExamTypeService({
    examTypeId: req.params.examTypeId,
    ...req.body,
  });
  return sendSuccess(res, "Exam type updated successfully", { examType });
});

export const createExamRecord = catchAsync(async (req, res) => {
  const examRecord = await createExamRecordService(req.body || {});
  return sendSuccess(
    res,
    "Exam record created successfully",
    { examRecord },
    201,
  );
});

export const listExamRecords = catchAsync(async (req, res) => {
  const examRecords = await listExamRecordsService({ user: req.user });
  return sendSuccess(res, "Exam records fetched successfully", {
    count: examRecords.length,
    examRecords,
  });
});

export const listExamRecordsByType = catchAsync(async (req, res) => {
  const examRecords = await listExamRecordsByTypeService({
    examTypeCode: req.params.examTypeCode,
    user: req.user,
  });
  return sendSuccess(res, "Exam records fetched successfully", {
    count: examRecords.length,
    examRecords,
  });
});

export const getExamRecordById = catchAsync(async (req, res) => {
  const examRecord = await getExamRecordByIdService({
    recordId: req.params.recordId,
  });
  return sendSuccess(res, "Exam record fetched successfully", { examRecord });
});

export const updateExamRecord = catchAsync(async (req, res) => {
  const examRecord = await updateExamRecordService({
    recordId: req.params.recordId,
    ...req.body,
  });
  return sendSuccess(res, "Exam record updated successfully", { examRecord });
});
