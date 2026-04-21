import express from "express";
import { createInstitution } from "./institution.controller.js";
import { protectUser, restrictTo } from "../user/user.middleware.js";

const router = express.Router();

router.post("/", protectUser, restrictTo("SUPER_ADMIN"), createInstitution);

export default router;
