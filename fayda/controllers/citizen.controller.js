import pool from "../config/pool.js";

const getCitizenByFaydaId = async (req, res) => {
  try {
    const { faydaId } = req.params;

    // Validate faydaId
    if (!faydaId) {
      return res.status(400).json({
        status: false,
        message: "Fayda ID is required",
      });
    }

    const citizenResult = await pool.query(
      "SELECT * FROM citizen WHERE fayda_id = $1",
      [faydaId],
    );

    if (citizenResult.rows.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Citizen not found",
      });
    }

    res.json({
      status: true,
      data: citizenResult.rows[0],
    });
  } catch (err) {
    console.error("Error fetching citizen:", err.message);

    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

export default getCitizenByFaydaId;
