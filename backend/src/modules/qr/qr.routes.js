import express from "express";
import { generateQrCode, getMyQrTokens, verifyQrToken } from "./qr.controller.js";
import { protectStudent } from "../students/student.middleware.js";

const router = express.Router();

// Student — protected routes
router.post("/generate", protectStudent, generateQrCode);
router.get("/my-tokens", protectStudent, getMyQrTokens);

// Public — no auth required (employer scans the QR)
router.get("/verify/:token", verifyQrToken);

export default router;
