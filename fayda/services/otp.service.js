import pool from "../config/pool.js";
import dotenv from "dotenv";
import { sendSMS } from "../utils/sms.js";
dotenv.config();


// Generate OTP and store in DB
export const generateOtp = async (faydaId) => {
  const citizenResult = await pool.query(
    "SELECT phone_number FROM citizen WHERE fayda_id = $1",
    [faydaId]
  );

  if (citizenResult.rows.length === 0) {
    throw new Error("Citizen not found");
  }

  const phoneNumber = citizenResult.rows[0].phone_number;

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || "5", 10);
  const expiresAt = Date.now() + otpExpiryMinutes * 60 * 1000;

  await pool.query("DELETE FROM otp_codes WHERE fayda_id = $1", [faydaId]);

  await pool.query(
    "INSERT INTO otp_codes (fayda_id, otp, expires_at) VALUES ($1, $2, $3)",
    [faydaId, otp, expiresAt],
  );

  try {
    const message = `Your Digital Academic Records verification code is: ${otp}. Valid for ${otpExpiryMinutes} minutes.`;
    await sendSMS({ to: `${phoneNumber}`, message });
    console.log(`✅ SMS OTP sent to +251${phoneNumber} [ ${otp} ]`);
  } catch (error) {
    console.error(`❌ Failed to send SMS to +251${phoneNumber}:`, error.message);
    console.log(`⚠️ FALLBACK: Your OTP code is [ ${otp} ]`);

    if (process.env.NODE_ENV === "production") {
      throw error;
    }
  }

  return otp;
};

// Verify OTP
export const verifyOtp = async (faydaId, otp) => {
  const result = await pool.query(
    `SELECT * FROM otp_codes
     WHERE fayda_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [faydaId],
  );
  
  if (result.rows.length === 0) {
    return { success: false, message: "No OTP found for this Fayda ID" };
  }

  const record = result.rows[0];

  // Check expiry
  if (Date.now() > record.expires_at) {
    await pool.query("DELETE FROM otp_codes WHERE fayda_id = $1", [faydaId]);
    return { success: false, message: "OTP expired" };
  }

  // Check match
  if (record.otp !== otp) {
    return { success: false, message: "Invalid OTP" };
  }

  // Delete after success (one-time use)
  await pool.query("DELETE FROM otp_codes WHERE fayda_id = $1", [faydaId]);

  return { success: true, message: "OTP verified successfully" };
};
