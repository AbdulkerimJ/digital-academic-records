import express from "express";
import {
  createExamType,
  listExamTypes,
  updateExamType,
  createExamRecord,
  listExamRecords,
  getExamRecordById,
  updateExamRecord,
  deleteExamRecord,
  getExamTypeById,
} from "./exam.controller.js";
import { protectUser, restrictTo } from "../users/user.middleware.js";

const router = express.Router();

router.use(protectUser);

router.get("/types", listExamTypes);
router.post("/types", restrictTo("SUPER_ADMIN"), createExamType);
router.get("/types/:examTypeId", getExamTypeById);
router.patch("/types/:examTypeId", restrictTo("SUPER_ADMIN"), updateExamType);

router.get("/", listExamRecords);
router.get("/:examId", getExamRecordById);
router.patch("/:examId", updateExamRecord);
router.post("/", createExamRecord);
router.delete("/:examId", deleteExamRecord);

export default router;
