import express from "express";
import {
  createExamLevel,
  listExamLevels,
  updateExamLevel,
  createExamRecord,
  listExamRecords,
  getExamRecordById,
  updateExamRecord,
  deleteExamRecord,
  getExamLevelById,
} from "./exam.controller.js";
import { protectUser, restrictTo } from "../users/user.middleware.js";

const router = express.Router();

router.use(protectUser);

router.get("/levels", listExamLevels);
router.post("/levels", restrictTo("SUPER_ADMIN"), createExamLevel);
router.get("/levels/:examLevelId", getExamLevelById);
router.patch("/levels/:examLevelId", restrictTo("SUPER_ADMIN"), updateExamLevel);

router.get("/", listExamRecords);
router.get("/:examId", getExamRecordById);
router.patch("/:examId", updateExamRecord);
router.post("/", createExamRecord);
router.delete("/:examId", deleteExamRecord);

export default router;
