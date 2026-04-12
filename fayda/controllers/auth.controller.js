import pool from "../config/pool.js";
import { generateOtp, verifyOtp } from "../services/otp.service.js";

// ======================
// SEND OTP CONTROLLER
// ======================
export const sendOtp = async (req, res) => {
  try {
    const { faydaId } = req.body || {};

    if (!faydaId) {
      return res.status(400).json({
        status: false,
        message: "Fayda ID is required",
      });
    }

    if (typeof faydaId !== "string") {
      return res.status(400).json({
        status: false,
        message: "Invalid Fayda ID",
      });
    }

    // Check if citizen exists
    const citizen = await pool.query(
      "SELECT * FROM citizen WHERE fayda_id = $1",
      [faydaId],
    );

    if (citizen.rows.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Citizen not found",
      });
    }

    await generateOtp(faydaId);

    return res.json({
      status: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Send OTP error:", error.message);

    return res.status(500).json({
      status: false,
      message: "Server error",
    });
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
      return res.status(400).json({
        status: false,
        message: "Valid Fayda ID and OTP are required",
      });
    }

    const result = await verifyOtp(faydaId, otp);

    if (!result.valid) {
      return res.status(401).json({
        status: false,
        message: result.message,
      });
    }

    return res.json({
      status: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP error:", error.message);

    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};
