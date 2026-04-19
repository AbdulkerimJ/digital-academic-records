import pool from "../config/pool.js";
import { generateOtp, verifyOtp } from "../services/otp.service.js";
import { sendError, sendSuccess } from "../utils/response.js";

// ======================
// SEND OTP CONTROLLER
// ======================
export const sendOtp = async (req, res) => {
  try {
    const { faydaId } = req.body || {};

    if (!faydaId) {
      return sendError(res, "Fayda ID is required", 400);
    }

    if (typeof faydaId !== "string") {
      return sendError(res, "Invalid Fayda ID", 400);
    }

    // Check if citizen exists
    const citizen = await pool.query(
      "SELECT * FROM citizen WHERE fayda_id = $1",
      [faydaId],
    );

    if (citizen.rows.length === 0) {
      return sendError(res, "Citizen not found", 404);
    }

    await generateOtp(faydaId);

    return sendSuccess(res, "OTP sent successfully");
  } catch (error) {
    console.error("Send OTP error:", error.message);

    return sendError(
      res,
      error.message || "Server error",
      error.statusCode || 500,
    );
  }
};

// ======================
// VERIFY OTP CONTROLLER
// ======================
export const verifyOtpController = async (req, res) => {
  try {
    const { faydaId, otp } = req.body || {};

    if (
      !faydaId ||
      typeof faydaId !== "string" ||
      !otp ||
      typeof otp !== "string"
    ) {
      return sendError(res, "Valid Fayda ID and OTP are required", 400);
    }

    const result = await verifyOtp(faydaId, otp);

    if (!result.success) {
      return sendError(res, result.message || "OTP verification failed", 401);
    }

    return sendSuccess(res, "OTP verified successfully");
  } catch (error) {
    console.error("Verify OTP error:", error.message);

    return sendError(
      res,
      error.message || "Server error",
      error.statusCode || 500,
    );
  }
};
