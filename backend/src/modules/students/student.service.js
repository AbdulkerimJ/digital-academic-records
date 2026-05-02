import AppError from "../../common/utils/appError.js";
import { findStudentById, findStudents, findStudentByNationalId, createStudentFromCitizen } from "./student.repository.js";

import { findExamRecords } from "../exams/exam.repository.js";
import { findDegrees } from "../degrees/degree.repository.js";
import { getCitizen } from "../citizens/fayda.client.js";
import csv from "csv-parser";
import { Readable } from "stream";

export const getStudentProfileService = async (id) => {
  const student = await findStudentById(id);
  if (!student) {
    throw new AppError("Student not found", 404);
  }
  return student;
};

export const getMyExamsService = async (studentId) => {

  return await findExamRecords({ studentId });
};

export const getMyDegreesService = async (studentId) => {
  return await findDegrees({ studentId });
};

// ===================== ADMIN ACTIONS =====================

export const listStudentsService = async ({ user, query }) => {
  const { search, page, limit } = query;

  // If not super admin, search term is REQUIRED
  if (user.role !== "SUPER_ADMIN" && !search) {
    throw new AppError("Please provide a search term to find a student.", 403);
  }

  return await findStudents({ search, page, limit });
};


export const getStudentByIdService = async (id) => {
  const student = await findStudentById(id);
  if (!student) {
    throw new AppError("Student not found", 404);
  }
  return student;
};

export const getStudentFullRecordsService = async (id) => {
  // 1. Verify student exists
  const student = await findStudentById(id);
  if (!student) {
    throw new AppError("Student not found", 404);
  }

  // 2. Fetch records in parallel
  const [exams, degrees] = await Promise.all([
    findExamRecords({ studentId: id }),
    findDegrees({ studentId: id }),
  ]);

  return {
    student,
    exams,
    degrees,
  };
};


export const registerStudentService = async (faydaId) => {
  if (!faydaId) {
    throw new AppError("Fayda ID is required", 400);
  }

  // 1. Check if already registered
  const existing = await findStudentByNationalId(faydaId);
  if (existing) {
    throw new AppError("Student is already registered in our system.", 400);
  }

  // 2. Fetch from Fayda
  const citizenRes = await getCitizen(faydaId);
  if (!citizenRes.success) {
    throw new AppError(
      citizenRes.message || "Citizen not found in national system",
      404,
    );
  }

  // 3. Create local record
  return await createStudentFromCitizen(faydaId, citizenRes.data);
};

export const registerBulkStudentsService = async (fileBuffer, onProgress) => {
  if (!fileBuffer) {
    throw new AppError("No file provided", 400);
  }

  const faydaIds = [];

  // Parse CSV
  await new Promise((resolve, reject) => {
    const stream = Readable.from(fileBuffer);
    stream
      .pipe(csv())
      .on("data", (data) => {
        // Assume column name is 'faydaId' (case insensitive)
        const id = data.faydaId || data.faydaid || data.FaydaId || Object.values(data)[0];
        if (id) faydaIds.push(id.trim());
      })
      .on("end", resolve)
      .on("error", reject);
  });

  if (faydaIds.length === 0) {
    throw new AppError("No valid Fayda IDs found in the CSV file.", 400);
  }

  const results = {
    total: faydaIds.length,
    successRate: "0%",
    successful: [],
    failed: [],
  };

  // Process sequentially to respect Fayda service
  for (let i = 0; i < faydaIds.length; i++) {
    const id = faydaIds[i];
    try {
      const student = await registerStudentService(id);
      results.successful.push({
        id,
        name: `${student.firstName} ${student.lastName}`,
      });
    } catch (err) {
      results.failed.push({
        id,
        reason: err.message,
      });
    }

    // Call progress callback if provided
    if (onProgress) {
      const progress = Math.round(((i + 1) / faydaIds.length) * 100);
      onProgress({
        percent: `${progress}%`,
        current: i + 1,
        total: faydaIds.length,
        lastResult: {
          id,
          success: !results.failed.find((f) => f.id === id),
        },
      });
    }
  }

  // Calculate success rate
  results.successRate = results.total > 0
    ? `${Math.round((results.successful.length / results.total) * 100)}%`
    : "0%";

  return results;
};

