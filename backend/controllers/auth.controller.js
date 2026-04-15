import pool from "../config/pool.js";
import catchAsync from "../utils/catchAsync.js";
import { getCitizen, sendOtp, verifyOtp } from "../services/fayda.client.js";
import { generateToken } from "../utils/jwt.js";
import { sendSuccess } from "../utils/response.js";

// STEP 1: LOGIN (send OTP via Fayda)
export const login = catchAsync(async (req, res) => {
  const { faydaId } = req.body || {};

  // ✅ validate input
  if (!faydaId) {
    return res.status(400).json({
      success: false,
      message: "faydaId is required",
    });
  }

  // ✅ check citizen exists in Fayda
  const citizenRes = await getCitizen(faydaId);

  if (!citizenRes.success) {
    return res.status(404).json({
      success: false,
      message: "Citizen not found",
    });
  }

  // ✅ send OTP via Fayda
  const otpRes = await sendOtp(faydaId);

  if (!otpRes.success) {
    return res.status(400).json({
      success: false,
      message: otpRes.message || "Failed to send OTP",
    });
  }

  res.json({
    success: true,
    message: "OTP sent successfully",
  });
});

// STEP 2: VERIFY OTP + LOGIN USER
export const verifyLogin = async (req, res) => {
  try {
    const { faydaId, otp } = req.body || {};

    // ✅ validate input
    if (!faydaId || !otp) {
      return res.status(400).json({
        success: false,
        message: "faydaId and otp are required",
      });
    }

    // ✅ verify OTP via Fayda
    const result = await verifyOtp(faydaId, otp);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message || "OTP verification failed",
      });
    }

    // ✅ check or create student
    let studentRes = await pool.query(
      "SELECT * FROM student WHERE national_id = $1",
      [faydaId]
    );

    let user;

    if (studentRes.rows.length === 0) {
      // ✅ fetch citizen safely
      const citizenRes = await getCitizen(faydaId);

      if (!citizenRes.success) {
        return res.status(404).json({
          success: false,
          message: citizenRes.message || "Citizen not found",
        });
      }

      const citizen = citizenRes.data;

      // ✅ insert new student
      const insertRes = await pool.query(
        `INSERT INTO student (national_id, first_name, last_name, date_of_birth)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [
          faydaId,
          citizen.first_name,
          citizen.last_name,
          citizen.date_of_birth,
        ]
      );

      user = insertRes.rows[0];
    } else {
      user = studentRes.rows[0];
    }

    // ✅ generate token
    const token = generateToken({
      id: user.id,
      faydaId: user.national_id,
    });

    sendSuccess(res, "Login successful", { token, user });
  } catch (err) {
    console.error("Verify login error:", err.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
