import express from "express";
import {

  getMe,
  getMyExams,
  getMyDegrees,
  listStudents,
  getStudentById,
  getStudentRecords,
  registerStudent,

  registerBulkStudents,
} from "./student.controller.js";

import {
  login,
  logout,
  refresh,
  verifyLogin,
} from "./auth.controller.js";
import { protectStudent } from "./student.middleware.js";
import { protectUser, restrictTo } from "../users/user.middleware.js";
import upload from "../../common/utils/upload.js";
import { submitRequest, getMyRequests } from "../correction-requests/correction-request.controller.js";

const router = express.Router();

// Auth
router.post("/login", login);
router.post("/verify", verifyLogin);
router.post("/refresh", refresh);
router.post("/logout", protectStudent, logout);

// Student Profile & Records
router.get("/me", protectStudent, getMe);
router.get("/me/exams", protectStudent, getMyExams);

router.get("/me/degrees", protectStudent, getMyDegrees);

// Correction Requests (Student facing)
router.post("/records/:recordId/correction", protectStudent, submitRequest);
router.get("/correction-requests", protectStudent, getMyRequests);


// Admin & Registrar Student Management
router.get("/", protectUser, listStudents);

router.post(
  "/register",
  protectUser,
  restrictTo("SUPER_ADMIN", "REGISTRAR"),
  registerStudent,
);

router.post(
  "/register-bulk",
  protectUser,
  restrictTo("SUPER_ADMIN", "REGISTRAR"),
  upload.single("file"),
  registerBulkStudents,
);

router.get("/:id", protectUser, getStudentById);
router.get("/:id/records", protectUser, getStudentRecords);




export default router;
