import AppError from "../../common/utils/appError.js";
import { findStudentById, findStudents } from "./student.repository.js";

import { findExamRecords } from "../exams/exam.repository.js";
import { findDegrees } from "../degrees/degree.repository.js";

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

