import pool from "../config/pool.js";
import catchAsync from "../utils/catchAsync.js";
import { getCitizen, sendOtp, verifyOtp } from "../services/fayda.client.js";
import { generateToken } from "../utils/jwt.js";

// STEP 1: LOGIN (send OTP via Fayda)
export const login = catchAsync(async (req, res) => {
  const { faydaId } = req.body || {};

    const citizen = await getCitizen(faydaId);

    if (!citizen.status) {
      return res.status(404).json({ message: "Citizen not found" });
    }

    await sendOtp(faydaId);

    res.json({
      message: "OTP sent successfully",
    });
});

// STEP 2: VERIFY OTP + LOGIN USER
export const verifyLogin = async (req, res) => {
  try {
    const { faydaId, otp } = req.body || {};

    const result = await verifyOtp(faydaId, otp);

    if (!result.status) {
      return res.status(400).json(result);
    }

    // get citizen data
    const citizenRes = await getCitizen(faydaId);
    const citizen = citizenRes.data;

    // check or create student
    let student = await pool.query(
      "SELECT * FROM student WHERE national_id = $1",
      [faydaId]
    );

    if (student.rows.length === 0) {
      student = await pool.query(
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
    }

    const user = student.rows[0];

    // generate token
    const token = generateToken({
      id: user.id,
      faydaId: user.national_id,
    });

    res.json({
      message: "Login successful",
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};