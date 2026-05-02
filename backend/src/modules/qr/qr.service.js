import crypto from "crypto";
import QRCode from "qrcode";
import AppError from "../../common/utils/appError.js";
import {
  createQrToken,
  findQrTokenByToken,
  findQrTokensByStudentId,
  deleteExpiredQrTokensByStudentId,
} from "./qr.repository.js";
import { getStudentFullRecordsService } from "../students/student.service.js";

// QR token validity in days (configurable via env)
const QR_TOKEN_EXPIRES_DAYS = parseInt(process.env.QR_TOKEN_EXPIRES_DAYS || "30", 10);

// The base URL that will be encoded into the QR code (employer-facing)
const APP_BASE_URL = process.env.APP_BASE_URL || "http://localhost:4000";

// ===================== STUDENT ACTIONS =====================

export const generateQrCodeService = async (studentId) => {
  // 1. Clean up expired tokens for this student
  await deleteExpiredQrTokensByStudentId(studentId);

  // 2. Generate a cryptographically secure token
  const token = crypto.randomBytes(32).toString("hex");

  // 3. Compute expiry
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + QR_TOKEN_EXPIRES_DAYS);

  // 4. Persist the token
  const qrRecord = await createQrToken({ studentId, token, expiresAt });

  // 5. Build the verification URL employers will land on when they scan
  const verificationUrl = `${APP_BASE_URL}/api/verify/${token}`;

  // 6. Generate QR code as a base64 PNG data URL
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
    errorCorrectionLevel: "H",
    width: 300,
    margin: 2,
  });

  return {
    tokenId: qrRecord.id,
    verificationUrl,
    expiresAt: qrRecord.expiresAt,
    createdAt: qrRecord.createdAt,
    qrCode: qrDataUrl, // base64 PNG — render directly as <img src="..." />
  };
};

export const getMyQrTokensService = async (studentId) => {
  // Clean up stale tokens first
  await deleteExpiredQrTokensByStudentId(studentId);
  return await findQrTokensByStudentId(studentId);
};

// ===================== PUBLIC VERIFICATION =====================

export const verifyQrTokenService = async (token) => {
  const qrRecord = await findQrTokenByToken(token);

  if (!qrRecord) {
    throw new AppError("Invalid or expired QR code.", 404);
  }

  // Check expiry
  if (new Date(qrRecord.expiresAt) < new Date()) {
    throw new AppError("This QR code has expired.", 410);
  }

  // Return the student's full academic records
  const records = await getStudentFullRecordsService(qrRecord.studentId);

  return records;
};
