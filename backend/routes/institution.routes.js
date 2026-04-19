import express from "express";
import { createInstitution } from "../controllers/institution.controller.js";
import { protectUser, restrictTo } from "../middleware/user.middleware.js";

const router = express.Router();

router.post("/", protectUser, restrictTo("SUPER_ADMIN"), createInstitution);

export default router;
