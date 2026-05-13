import express from "express";
import {
  createRequest,
  getAllRequests,
  respondToRequest,
  deleteRequest
} from "./support-request.controller.js";
import { protectUser, restrictTo } from "../users/user.middleware.js";

const router = express.Router();

// Public creation
router.post("/", createRequest);

// Admin only management
router.get("/", protectUser, restrictTo("SUPER_ADMIN"), getAllRequests);
router.post("/:id/respond", protectUser, restrictTo("SUPER_ADMIN"), respondToRequest);
router.delete("/:id", protectUser, restrictTo("SUPER_ADMIN"), deleteRequest);

export default router;
