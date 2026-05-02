import AppError from "../../common/utils/appError.js";
import parseNumber from "../../common/utils/parseNumber.js";
import {
  createExamLevelRecord,
  findExamLevelByCode,
  findExamLevelById,
  findExamLevels,
  updateExamLevelById,
  createExamRecordRecord,
  findExamRecordById,
  findExamRecords,
  updateExamRecordById,
  deleteExamRecordById,
} from "./exam.repository.js";
import { findInstitutionById } from "../institutions/institution.repository.js";
import { findStudentById, findStudentByNationalId } from "../students/student.repository.js";
import csv from "csv-parser";
import { Readable } from "stream";

const normalizeString = (value) =>
  value === undefined || value === null ? null : String(value).trim();

export const createExamLevelService = async ({ code, name, isActive }) => {
  if (!code || !name) {
    throw new AppError("Exam level code and name are required.", 400);
  }

  const normalizedCode = normalizeString(code).toUpperCase();
  const normalizedName = normalizeString(name);

  const existingType = await findExamLevelByCode(normalizedCode);
  if (existingType) {
    throw new AppError("Exam level code already exists.", 400);
  }

  return createExamLevelRecord({
    code: normalizedCode,
    name: normalizedName,
    isActive: isActive === undefined ? true : Boolean(isActive),
  });
};

export const listExamLevelsService = async () => {
  return findExamLevels();
};

export const updateExamLevelService = async ({
  examLevelId,
  code,
  name,
  isActive,
}) => {
  if (!examLevelId) {
    throw new AppError("Exam level is required.", 400);
  }

  const existingType = await findExamLevelById(examLevelId);
  if (!existingType) {
    throw new AppError("Exam level not found.", 404);
  }

  const normalizedCode =
    code === undefined ? null : normalizeString(code).toUpperCase();
  const normalizedName = name === undefined ? null : normalizeString(name);
  const normalizedIsActive = isActive === undefined ? null : Boolean(isActive);

  if (normalizedCode !== null) {
    const duplicate = await findExamLevelByCode(normalizedCode);
    if (duplicate && duplicate.id !== existingType.id) {
      throw new AppError("Exam level code already exists", 400);
    }
  }

  return updateExamLevelById({
    id: examLevelId,
    code: normalizedCode,
    name: normalizedName,
    isActive: normalizedIsActive,
  });
};

export const createExamRecordService = async ({ user, data = {} }) => {
  let {
    studentId,
    nationalId,
    examLevelId,
    examLevelCode,
    institutionId,
    year,
    totalScore,
    averageScore,
    percentile,
    resultStatus,
  } = data;

  // 1. Institution context
  if (user.role !== "SUPER_ADMIN") {
    if (!user.institutionId) {
      throw new AppError("Institution context missing for user.", 400);
    }
    institutionId = user.institutionId;
  } else {
    if (!institutionId) {
      throw new AppError("Institution ID is required for super admin.", 400);
    }
  }

  // 2. Resolve Student
  let student;
  if (studentId) {
    student = await findStudentById(studentId);
  } else if (nationalId) {
    student = await findStudentByNationalId(nationalId);
  }

  if (!student) {
    throw new AppError("Student not registered.", 404);
  }
  studentId = student.id;

  // 3. Resolve Exam Level
  let examLevel;
  if (examLevelId) {
    examLevel = await findExamLevelById(examLevelId);
  } else if (examLevelCode) {
    examLevel = await findExamLevelByCode(normalizeString(examLevelCode).toUpperCase());
  }

  if (!examLevel || !examLevel.isActive) {
    throw new AppError("Exam level is not found or inactive.", 400);
  }
  examLevelId = examLevel.id;

  // 4. Validation
  const parsedYear = parseNumber(year, "Year");
  if (!parsedYear || parsedYear <= 0) {
    throw new AppError("A valid year is required.", 400);
  }

  const parsedTotalScore = parseNumber(totalScore, "Total score");
  const parsedAverageScore = parseNumber(averageScore, "Average score");
  const parsedPercentile = parseNumber(percentile, "Percentile");

  if (
    parsedTotalScore === null &&
    parsedAverageScore === null &&
    parsedPercentile === null
  ) {
    throw new AppError("At least one exam score field is required.", 400);
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
    examLevelId,
    institutionId,
    year: parsedYear,
    totalScore: parsedTotalScore,
    averageScore: parsedAverageScore,
    percentile: parsedPercentile,
    resultStatus: normalizedResultStatus.toUpperCase(),
  });
};

export const uploadBulkExamsService = async ({ user, fileBuffer, onProgress }) => {
  if (!fileBuffer) {
    throw new AppError("No file provided", 400);
  }

  const records = [];

  // Parse CSV
  await new Promise((resolve, reject) => {
    const stream = Readable.from(fileBuffer);
    stream
      .pipe(csv())
      .on("data", (data) => {
        records.push(data);
      })
      .on("end", resolve)
      .on("error", reject);
  });

  if (records.length === 0) {
    throw new AppError("No records found in the CSV file.", 400);
  }

  const results = {
    total: records.length,
    successRate: "0%",
    successful: [],
    failed: [],
  };

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    try {
      // Map common CSV headers to service expectations
      const mappedData = {
        nationalId: record.nationalId || record.nationalid || record.NationalId,
        examLevelCode: record.examLevelCode || record.examlevelcode || record.ExamLevelCode,
        year: record.year || record.Year,
        totalScore: record.totalScore || record.totalscore || record.TotalScore,
        averageScore: record.averageScore || record.averagescore || record.AverageScore,
        percentile: record.percentile || record.Percentile,
        resultStatus: record.resultStatus || record.resultstatus || record.ResultStatus,
      };

      const exam = await createExamRecordService({ user, data: mappedData });
      results.successful.push({
        id: mappedData.nationalId,
        year: mappedData.year,
      });
    } catch (err) {
      results.failed.push({
        id: record.nationalId || record.nationalid || `Row ${i + 1}`,
        reason: err.message,
      });
    }

    if (onProgress) {
      const progress = Math.round(((i + 1) / records.length) * 100);
      onProgress({
        percent: `${progress}%`,
        current: i + 1,
        total: records.length,
        lastResult: {
          id: record.nationalId || record.nationalid || `Row ${i + 1}`,
          success: !results.failed.find((f) => (f.id === (record.nationalId || record.nationalid) || f.id === `Row ${i + 1}`)),
        },
      });
    }
  }

  results.successRate = results.total > 0
    ? `${Math.round((results.successful.length / results.total) * 100)}%`
    : "0%";

  return results;
};

export const listExamRecordsService = async ({
  user,
  filters = {},
  pagination = {},
}) => {
  const query = { ...filters };

  // enforce institution scope
  if (user.role !== "SUPER_ADMIN") {
    if (!user.institutionId) {
      throw new AppError("Institution is required.", 400);
    }
    query.institutionId = user.institutionId;
  }

  return findExamRecords(query, pagination);
};

export const getExamLevelByIdService = async ({ examLevelId }) => {
  if (!examLevelId) {
    throw new AppError("Exam level ID is required.", 400);
  }

  const examLevel = await findExamLevelById(examLevelId);
  if (!examLevel) {
    throw new AppError("Exam level not found.", 404);
  }
  return examLevel;
};

export const getExamRecordByIdService = async ({ user, examId }) => {
  if (!examId) {
    throw new AppError("Exam ID is required.", 400);
  }

  let institutionId = null;

  if (user.role !== "SUPER_ADMIN") {
    if (!user.institutionId) {
      throw new AppError("Institution context missing for user.", 400);
    }

    institutionId = user.institutionId;
  }

  const examRecord = await findExamRecordById(examId, institutionId);
  if (!examRecord) {
    throw new AppError("Exam record not found.", 404);
  }
  return examRecord;
};

export const updateExamRecordService = async ({
  user,
  examId,
  year,
  totalScore,
  averageScore,
  percentile,
  resultStatus,
}) => {
  if (!examId) {
    throw new AppError("Exam ID is required.", 400);
  }

  let institutionId = null;

  if (user.role !== "SUPER_ADMIN") {
    if (!user.institutionId) {
      throw new AppError("Institution context missing for user.", 400);
    }

    institutionId = user.institutionId;
  } 

  const currentRecord = await findExamRecordById(examId, institutionId);
  if (!currentRecord) {
    throw new AppError("Exam record not found.", 404);
  }

  const parsedYear = year === undefined ? null : parseNumber(year, "Year");
  const parsedTotalScore =
    totalScore === undefined ? null : parseNumber(totalScore, "Total score");
  const parsedAverageScore =
    averageScore === undefined
      ? null
      : parseNumber(averageScore, "Average score");
  const parsedPercentile =
    percentile === undefined ? null : parseNumber(percentile, "Percentile");

  if (parsedYear !== null && parsedYear <= 0) {
    throw new AppError("Year must be greater than 0.", 400);
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
    id: examId,
    institutionId,
    year: parsedYear,
    totalScore: parsedTotalScore,
    averageScore: parsedAverageScore,
    percentile: parsedPercentile,
    resultStatus: normalizedResultStatus,
  });

  return findExamRecordById(examId);
};
export const deleteExamRecordService = async ({ user, examId }) => {
  if (!examId) {
    throw new AppError("Exam ID is required.", 400);
  }

  let institutionId = null;

  if (user.role !== "SUPER_ADMIN") {
    if (!user.institutionId) {
      throw new AppError("Institution context missing for user.", 400);
    }

    institutionId = user.institutionId;
  }

  const deleted = await deleteExamRecordById(examId, institutionId);

  if (!deleted) {
    throw new AppError(
      "Exam record not found or you are not authorized to delete it.",
      404,
    );
  }

  return deleted;
};
