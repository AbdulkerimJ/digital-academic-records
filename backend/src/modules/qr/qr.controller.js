import catchAsync from "../../common/utils/catchAsync.js";
import { sendSuccess } from "../../common/utils/response.js";
import {
  generateQrCodeService,
  getMyQrTokensService,
  verifyQrTokenService,
  deleteQrTokenService,
} from "./qr.service.js";


// ===================== STUDENT HANDLERS =====================

export const generateQrCode = catchAsync(async (req, res) => {
  const result = await generateQrCodeService(req.user.id);
  return sendSuccess(res, "QR code generated successfully", result, 201);
});

export const previewQrCode = catchAsync(async (req, res) => {
  const result = await generateQrCodeService(req.user.id);
  const html = `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>QR Code Preview</title>

  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #eef2f7, #f8fafc);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }

    .card {
      background: #ffffff;
      padding: 40px 32px;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
      text-align: center;
      max-width: 380px;
      width: 100%;
      transition: transform 0.2s ease;
    }

    .card:hover {
      transform: translateY(-4px);
    }

    h2 {
      font-size: 22px;
      margin-bottom: 16px;
      color: #1f2937;
    }

    img {
      margin: 20px auto;
      border-radius: 12px;
      padding: 10px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
    }

    .url-box {
      margin-top: 16px;
      padding: 12px;
      background: #f3f4f6;
      border-radius: 8px;
      font-size: 13px;
      color: #374151;
      word-break: break-word;
    }

    .label {
      font-weight: 600;
      display: block;
      margin-bottom: 6px;
      color: #111827;
    }

    small {
      display: block;
      margin-top: 14px;
      color: #6b7280;
      font-size: 12px;
    }

    .footer {
      margin-top: 20px;
      font-size: 12px;
      color: #9ca3af;
    }
  </style>
</head>

<body>
  <div class="card">
    <h2>📄 Academic Records QR</h2>

    <img 
      src="${result.qrCode}" 
      width="260" 
      height="260" 
      alt="QR Code" 
    />

    <div class="url-box">
      <span class="label">Verification URL</span>
      ${result.verificationUrl}
    </div>

    <small>
      ⏳ Expires: ${new Date(result.expiresAt).toLocaleString()}
    </small>

    <div class="footer">
      Scan the QR code to verify authenticity
    </div>
  </div>
</body>
</html>
  `;
  res.setHeader("Content-Type", "text/html");
  res.send(html);
});



export const getMyQrTokens = catchAsync(async (req, res) => {
  const tokens = await getMyQrTokensService(req.user.id);
  return sendSuccess(res, "Your QR tokens fetched successfully", {
    count: tokens.length,
    tokens,
  });
});

export const deleteQrToken = catchAsync(async (req, res) => {
  await deleteQrTokenService(req.params.id, req.user.id);
  return sendSuccess(res, "QR token deleted successfully");
});


// ===================== PUBLIC HANDLER (Employer) =====================

export const verifyQrToken = catchAsync(async (req, res) => {
  const { token } = req.params;
  const records = await verifyQrTokenService(token);
  return sendSuccess(res, "Student records verified successfully", records);
});
