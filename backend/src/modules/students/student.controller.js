import catchAsync from "../../common/utils/catchAsync.js";
import AppError from "../../common/utils/appError.js";
import { sendSuccess } from "../../common/utils/response.js";
import { 
  findExamRecordById 
} from "../exams/exam.repository.js";
import { 
  findDegreeById 
} from "../degrees/degree.repository.js";
import {
  getStudentProfileService,
  getMyExamsService,
  getMyDegreesService,
  listStudentsService,
  getStudentByIdService,
  getStudentFullRecordsService,
  registerStudentService,
  registerBulkStudentsService,
  deleteStudentService,
} from "./student.service.js";

// ===================== STUDENT HANDLERS =====================

export const getMe = catchAsync(async (req, res) => {
  const student = await getStudentProfileService(req.user.id);
  return sendSuccess(res, "Student profile fetched successfully", { student });
});

export const getMyExams = catchAsync(async (req, res) => {
  const { examRecords, count } = await getMyExamsService(req.user.id);
  return sendSuccess(res, "Your exam records fetched successfully", { count, exams: examRecords });
});

export const getMyDegrees = catchAsync(async (req, res) => {
  const { degrees, count } = await getMyDegreesService(req.user.id);
  return sendSuccess(res, "Your degree records fetched successfully", { count, degrees });
});

export const getMyDegreeDetail = catchAsync(async (req, res) => {
  const degree = await findDegreeById(req.params.id);
  if (!degree || degree.studentId !== req.user.id) {
    throw new AppError("Degree record not found", 404);
  }
  return sendSuccess(res, "Degree record fetched successfully", { degree });
});

export const getMyExamDetail = catchAsync(async (req, res) => {
  const exam = await findExamRecordById(req.params.id);
  if (!exam || exam.studentId !== req.user.id) {
    throw new AppError("Exam record not found", 404);
  }
  return sendSuccess(res, "Exam record fetched successfully", { exam });
});

// ===================== ADMIN AND REGISTRAR HANDLERS =====================

export const listStudents = catchAsync(async (req, res) => {
  const { search, page, limit, startDate, endDate } = req.query;
  const { students, totalCount } = await listStudentsService({ 
    user: req.user,
    query: { search, page, limit, startDate, endDate } 
  });
  return sendSuccess(res, "Students list fetched successfully", { count: totalCount, students });
});


export const getStudentById = catchAsync(async (req, res) => {
  const student = await getStudentByIdService(req.params.id);
  return sendSuccess(res, "Student detail fetched successfully", { student });
});

export const getStudentRecords = catchAsync(async (req, res) => {
  const data = await getStudentFullRecordsService(req.params.id, req.user);
  return sendSuccess(res, "Student records fetched successfully", data);
});


export const registerStudent = catchAsync(async (req, res) => {
  const { faydaId } = req.body || {};
  const student = await registerStudentService({ faydaId, user: req.user, req });
  return sendSuccess(res, "Student registered successfully", { student });
});

export const removeStudent = catchAsync(async (req, res) => {
  const { id } = req.params;
  const student = await deleteStudentService({ studentId: id, user: req.user, req });
  return sendSuccess(res, "Student deleted successfully", { student });
});

export const registerBulkStudents = catchAsync(async (req, res) => {
  // 1. Check for file BEFORE setting SSE headers
  if (!req.file) {
    throw new AppError("No file provided. Please upload a CSV file.", 400);
  }

  // 2. Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const onProgress = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const results = await registerBulkStudentsService({
      fileBuffer: req.file.buffer,
      onProgress,
      user: req.user,
      req,
    });

    // Send final results and close stream
    res.write(`data: ${JSON.stringify({ complete: true, results })}\n\n`);
    res.end();
  } catch (err) {
    // If an error happens during the stream, send it as an SSE event
    res.write(`data: ${JSON.stringify({ error: err.message || "Internal server error during processing" })}\n\n`);
    res.end();
  }
});
