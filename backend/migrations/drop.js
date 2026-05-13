import pool from "../src/common/config/pool.js";

async function dropTables() {
  try {
    console.log("Dropping database tables...");

    await pool.query(`
      DROP TABLE IF EXISTS
        audit_log,
        correction_request,
        app_user,
        degrees,
        exams,
        student,
        degree_titles,
        degree_levels,
        record_types,
        exam_levels,
        departments,
        colleges,
        institution,
        roles,
        support_request
      CASCADE;
    `);

    console.log("Database tables dropped successfully!");
  } catch (err) {
    console.error("Drop failed:", err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

dropTables();
