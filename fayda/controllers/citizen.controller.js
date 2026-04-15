import pool from "../config/pool.js";
import { sendError, sendSuccess } from "../utils/response.js";

const getCitizenByFaydaId = async (req, res) => {
  try {
    const { faydaId } = req.params || {};

    // Validate faydaId
    if (!faydaId) {
      return sendError(res, "Fayda ID is required", 400);
    }

    const citizenResult = await pool.query(
      "SELECT * FROM citizen WHERE fayda_id = $1",
      [faydaId],
    );

    if (citizenResult.rows.length === 0) {
      return sendError(res, "Citizen not found", 404);
    }

    return sendSuccess(
      res,
      "Citizen fetched successfully",
      citizenResult.rows[0],
    );
  } catch (err) {
    console.error("Error fetching citizen:", err.message);

    return sendError(res, "Server error", 500);
  }
};

export default getCitizenByFaydaId;
