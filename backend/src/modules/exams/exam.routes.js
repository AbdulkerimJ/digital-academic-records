import express from "express";
import {
  createExamType,
  listExamTypes,
  updateExamType,
  createExamRecord,
  listExamRecords,
  getExamRecordById,
  updateExamRecord,
  listExamRecordsByType,
} from "./exam.controller.js";
import { protectUser, restrictTo } from "../users/user.middleware.js";

const router = express.Router();

router.use(protectUser);

router.get("/types", listExamTypes);
router.post("/types", restrictTo("SUPER_ADMIN"), createExamType);
router.patch("/types/:examTypeId", restrictTo("SUPER_ADMIN"), updateExamType);

router.get("/records", listExamRecords);
router.get("/records/type/:examTypeCode", listExamRecordsByType);
router.post("/records", createExamRecord);
router.get("/records/:recordId", getExamRecordById);
router.patch("/records/:recordId", updateExamRecord);

export default router;
