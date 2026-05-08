import express from "express";
import { getDashboardStats } from "./dashboard.controller.js";
import { protectUser } from "../users/user.middleware.js";

const router = express.Router();

router.get("/stats", protectUser, getDashboardStats);

export default router;
