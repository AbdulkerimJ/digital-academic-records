import catchAsync from "../../common/utils/catchAsync.js";
import { sendSuccess } from "../../common/utils/response.js";
import {
  getStudentProfileService,
  getMyExamsService,
  getMyDegreesService,
  listStudentsService,
  getStudentByIdService,
} from "./student.service.js";

// ===================== STUDENT HANDLERS =====================

export const getMe = catchAsync(async (req, res) => {
  const student = await getStudentProfileService(req.user.id);
  return sendSuccess(res, "Student profile fetched successfully", { student });
});

export const getMyExams = catchAsync(async (req, res) => {
  const exams = await getMyExamsService(req.user.id);
  return sendSuccess(res, "Your exam records fetched successfully", { count: exams.length, exams });
});

export const getMyDegrees = catchAsync(async (req, res) => {
  const degrees = await getMyDegreesService(req.user.id);
  return sendSuccess(res, "Your degree records fetched successfully", { count: degrees.length, degrees });
});

// ===================== ADMIN HANDLERS =====================

export const listStudents = catchAsync(async (req, res) => {
  const { search, page, limit } = req.query;
  const students = await listStudentsService({ 
    user: req.user,
    query: { search, page, limit } 
  });
  return sendSuccess(res, "Students list fetched successfully", { count: students.length, students });
});




export const getStudentById = catchAsync(async (req, res) => {
  const student = await getStudentByIdService(req.params.id);
  return sendSuccess(res, "Student detail fetched successfully", { student });
});
