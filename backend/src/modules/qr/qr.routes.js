import express from "express";
import { generateQrCode, getMyQrTokens, verifyQrToken, previewQrCode, deleteQrToken } from "./qr.controller.js";
import { qrLimiter } from "../../common/middlewares/rateLimiter.js";


import { protectStudent } from "../students/student.middleware.js";

const router = express.Router();

// Student — protected routes
router.post("/generate", protectStudent, generateQrCode);
router.get("/preview", protectStudent, previewQrCode);
router.get("/my-tokens", protectStudent, getMyQrTokens);
router.delete("/:id", protectStudent, deleteQrToken);



// Public — no auth required (employer scans the QR)
router.get("/verify/:token", qrLimiter, verifyQrToken);

export default router;
