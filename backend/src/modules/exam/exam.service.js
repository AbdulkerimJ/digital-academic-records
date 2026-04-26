import AppError from "../../common/utils/appError.js";
import {
  createExamTypeRecord,
  findExamTypeByCode,
  findExamTypeById,
  findExamTypes,
  updateExamTypeById,
  createExamRecordRecord,
  findExamRecordById,
  findExamRecords,
  updateExamRecordById,
} from "./exam.repository.js";

const normalizeString = (value) =>
  value === undefined || value === null ? null : String(value).trim();

export const createExamTypeService = async ({ code, name, isActive }) => {
  if (!code || !name) {
    throw new AppError("Exam type code and name are required.", 400);
  }

  const normalizedCode = normalizeString(code).toUpperCase();
  const normalizedName = normalizeString(name);

  const existingType = await findExamTypeByCode(normalizedCode);
  if (existingType) {
    throw new AppError("Exam type code already exists.", 400);
  }

  return createExamTypeRecord({
    code: normalizedCode,
    name: normalizedName,
    isActive: isActive === undefined ? true : Boolean(isActive),
  });
};

export const listExamTypesService = async () => {
  return findExamTypes();
};

export const updateExamTypeService = async ({
  examTypeId,
  code,
  name,
  isActive,
}) => {
  if (!examTypeId) {
    throw new AppError("Exam type is required.", 400);
  }

  const existingType = await findExamTypeById(examTypeId);
  if (!existingType) {
    throw new AppError("Exam type not found.", 404);
  }

  const normalizedCode =
    code === undefined ? null : normalizeString(code).toUpperCase();
  const normalizedName = name === undefined ? null : normalizeString(name);
  const normalizedIsActive = isActive === undefined ? null : Boolean(isActive);

  if (normalizedCode !== null) {
    const duplicate = await findExamTypeByCode(normalizedCode);
    if (duplicate && duplicate.id !== existingType.id) {
      throw new AppError("Exam type code already exists", 400);
    }
  }

  return updateExamTypeById({
    id: examTypeId,
    code: normalizedCode,
    name: normalizedName,
    isActive: normalizedIsActive,
  });
};

export const createExamRecordService = async ({
  studentId,
  examTypeId,
  institutionId,
  year,
  totalScore,
  averageScore,
  percentile,
  resultStatus,
}) => {
  if (!studentId || !examTypeId || !institutionId || year === undefined) {
    throw new AppError(
      "Student ID, exam type, institution ID, and year are required.",
      400,
    );
  }

  const examType = await findExamTypeById(examTypeId);
  if (!examType || !examType.isActive) {
    throw new AppError("Exam type not found or is inactive.", 400);
  }

  const normalizedResultStatus = normalizeString(resultStatus);
  if (
    !normalizedResultStatus ||
    !["PASS", "FAIL"].includes(normalizedResultStatus.toUpperCase())
  ) {
    throw new AppError("Result status must be PASS or FAIL.", 400);
  }

  return createExamRecordRecord({
    studentId,
    examTypeId,
    institutionId,
    year: Number(year),
    totalScore: totalScore === undefined ? null : Number(totalScore),
    averageScore: averageScore === undefined ? null : Number(averageScore),
    percentile: percentile === undefined ? null : Number(percentile),
    resultStatus: normalizedResultStatus.toUpperCase(),
  });
};

export const listExamRecordsService = async ({ user }) => {
  const query = {};

  if (user.role !== "SUPER_ADMIN") {
    if (!user.institutionId) {
      throw new AppError("Institution is required.", 400);
    }
    query.institutionId = user.institutionId;
  }

  return findExamRecords(query);
};

export const listExamRecordsByTypeService = async ({ examTypeCode, user }) => {
  const normalizedCode = normalizeString(examTypeCode);
  if (!normalizedCode) {
    throw new AppError("Exam type is required.", 400);
  }

  const query = {
    examTypeCode: normalizedCode,
  };

  if (user.role !== "SUPER_ADMIN") {
    if (!user.institutionId) {
      throw new AppError("Institution is required.", 400);
    }
    query.institutionId = user.institutionId;
  }

  return findExamRecords(query);
};

export const getExamRecordByIdService = async ({ recordId }) => {
  if (!recordId) {
    throw new AppError("Record ID is required.", 400);
  }

  const examRecord = await findExamRecordById(recordId);
  if (!examRecord) {
    throw new AppError("Exam record not found.", 404);
  }

  return examRecord;
};

export const updateExamRecordService = async ({
  recordId,
  year,
  totalScore,
  averageScore,
  percentile,
  resultStatus,
}) => {
  if (!recordId) {
    throw new AppError("Record ID is required.", 400);
  }

  const currentRecord = await findExamRecordById(recordId);
  if (!currentRecord) {
    throw new AppError("Exam record not found.", 404);
  }

  const normalizedResultStatus =
    resultStatus === undefined
      ? null
      : normalizeString(resultStatus).toUpperCase();

  if (
    normalizedResultStatus !== null &&
    !["PASS", "FAIL"].includes(normalizedResultStatus)
  ) {
    throw new AppError("Result status must be PASS or FAIL.", 400);
  }

  await updateExamRecordById({
    id: recordId,
    year: year === undefined ? null : Number(year),
    totalScore: totalScore === undefined ? null : Number(totalScore),
    averageScore: averageScore === undefined ? null : Number(averageScore),
    percentile: percentile === undefined ? null : Number(percentile),
    resultStatus: normalizedResultStatus,
  });

  return findExamRecordById(recordId);
};
