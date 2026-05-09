import AppError from "../../common/utils/appError.js";
import { translateDatabaseError } from "../../common/utils/dbErrorHelper.js";
import { findStudentById, findStudents, findStudentByNationalId, findStudentByNationalIdAll, restoreStudentById, createStudentFromCitizen, deleteStudentById } from "./student.repository.js";

import { findExamRecords } from "../exams/exam.repository.js";
import { findDegrees } from "../degrees/degree.repository.js";
import { getCitizen } from "../citizens/fayda.client.js";
import csv from "csv-parser";
import { Readable } from "stream";
import { logActionService } from "../audit/audit.service.js";

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
  const { search, page, limit, startDate, endDate } = query;

  // If not super admin, search term is REQUIRED
  if (user.roleName !== "SUPER_ADMIN" && !search) {
    throw new AppError("Please provide a search term to find a student.", 403);
  }

  return await findStudents({ search, page, limit, startDate, endDate });
};


export const getStudentByIdService = async (id) => {
  const student = await findStudentById(id);
  if (!student) {
    throw new AppError("Student not found", 404);
  }
  return student;
};

export const getStudentFullRecordsService = async (id, user) => {
  // 1. Verify student exists
  const student = await findStudentById(id);
  if (!student) {
    throw new AppError("Student not found", 404);
  }

  // 2. Prepare filter logic based on role
  let examFilter = { studentId: id };
  let degreeFilter = { studentId: id };

  if (user.roleName === "REGISTRAR") {
    // If college admin, they only see their own degrees and NO exams
    if (user.institutionType === "COLLEGE") {
      degreeFilter.institutionId = user.institutionId;
      examFilter = null; // Mark as restricted
    } 
    // If exam board admin, they only see their own exams and NO degrees
    else if (user.institutionType === "EXAM_BOARD") {
      examFilter.institutionId = user.institutionId;
      degreeFilter = null; // Mark as restricted
    }
  }

  // 3. Fetch records in parallel (conditionally)
  const [exams, degrees] = await Promise.all([
    examFilter ? findExamRecords(examFilter) : Promise.resolve([]),
    degreeFilter ? findDegrees(degreeFilter) : Promise.resolve([]),
  ]);

  return {
    student,
    exams,
    degrees,
  };
};


export const registerStudentService = async ({ faydaId, user, req }) => {
  if (!faydaId) {
    throw new AppError("Fayda ID is required", 400);
  }

  // 1. Check if already registered (including deleted)
  const allStudent = await findStudentByNationalIdAll(faydaId);
  if (allStudent) {
    if (!allStudent.isDeleted) {
      throw new AppError("Student is already registered in our system.", 400);
    }
    // RESTORE logic: if they exist but are deleted, we un-delete them
    await restoreStudentById(allStudent.id);
    const restored = await findStudentById(allStudent.id);

    await logActionService({
      user,
      action: "RESTORE_STUDENT",
      entityType: "STUDENT",
      entityId: allStudent.id,
      newValues: restored,
      req,
    });

    return restored;
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
  const student = await createStudentFromCitizen(faydaId, citizenRes.data);

  await logActionService({
    user,
    action: "REGISTER_STUDENT",
    entityType: "STUDENT",
    entityId: student.id,
    newValues: student,
    req,
  });

  return student;
};

export const registerBulkStudentsService = async ({ fileBuffer, onProgress, user, req }) => {
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
      const student = await registerStudentService({ faydaId: id, user, req });
      results.successful.push({
        id,
        name: `${student.firstName} ${student.lastName}`,
      });
    } catch (err) {
      const translated = translateDatabaseError(err);
      results.failed.push({
        id,
        reason: translated ? translated.message : err.message,
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

  await logActionService({
    user,
    action: "BULK_REGISTER_STUDENTS",
    entityType: "STUDENT",
    entityId: "BULK",
    newValues: { successful: results.successful.length, failed: results.failed.length },
    req,
  });

  return results;
};

export const deleteStudentService = async ({ studentId, user, req }) => {
  const student = await findStudentById(studentId);
  if (!student) {
    throw new AppError("Student not found", 404);
  }

  const result = await deleteStudentById(studentId);
  if (!result) {
    throw new AppError("Failed to delete student.", 500);
  }

  await logActionService({
    user,
    action: "DELETE_STUDENT",
    entityType: "STUDENT",
    entityId: studentId,
    oldValues: student,
    req,
  });

  return result;
};
