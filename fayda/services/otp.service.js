import pool from "../config/pool.js";

// Generate OTP and store in DB
export const generateOtp = async (faydaId) => {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 2 * 60 * 1000; // 2 minutes

  // delete old OTPs for this user
  await pool.query("DELETE FROM otp_codes WHERE fayda_id = $1", [faydaId]);

  // Insert new OTP
  await pool.query(
    "INSERT INTO otp_codes (fayda_id, otp, expires_at) VALUES ($1, $2, $3)",
    [faydaId, otp, expiresAt],
  );

  // Simulate sending OTP via SMS (Bontu will implement actual SMS sending later)
  console.log(`OTP for ${faydaId}: ${otp}`);

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
