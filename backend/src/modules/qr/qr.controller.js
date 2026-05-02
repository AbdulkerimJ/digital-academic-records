import catchAsync from "../../common/utils/catchAsync.js";
import { sendSuccess } from "../../common/utils/response.js";
import {
  generateQrCodeService,
  getMyQrTokensService,
  verifyQrTokenService,
} from "./qr.service.js";

// ===================== STUDENT HANDLERS =====================

export const generateQrCode = catchAsync(async (req, res) => {
  const result = await generateQrCodeService(req.user.id);
  return sendSuccess(res, "QR code generated successfully", result, 201);
});

export const getMyQrTokens = catchAsync(async (req, res) => {
  const tokens = await getMyQrTokensService(req.user.id);
  return sendSuccess(res, "Your QR tokens fetched successfully", {
    count: tokens.length,
    tokens,
  });
});

// ===================== PUBLIC HANDLER (Employer) =====================

export const verifyQrToken = catchAsync(async (req, res) => {
  const { token } = req.params;
  const records = await verifyQrTokenService(token);
  return sendSuccess(res, "Student records verified successfully", records);
});
