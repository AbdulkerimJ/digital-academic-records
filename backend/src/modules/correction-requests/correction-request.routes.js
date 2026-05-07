import express from "express";
import {
  listRequests,
  getRequestDetail,
  approveRequest,
  rejectRequest,
} from "./correction-request.controller.js";
import { protectUser } from "../users/user.middleware.js";

const router = express.Router();

router.use(protectUser);

router.get("/", listRequests);
router.patch("/:id/approve", approveRequest);
router.patch("/:id/reject", rejectRequest);
router.get("/:id", getRequestDetail);

export default router;
