import express from "express";
import { protectUser, restrictTo } from "../users/user.middleware.js";
import { listAuditLogs } from "./audit.controller.js";

const router = express.Router();

router.get(
  "/",
  protectUser,
  restrictTo("SUPER_ADMIN", "REGISTRAR"),
  listAuditLogs
);

export default router;
