import pool from "../config/pool.js";
async function seed() {
  try {
    console.log("Seeding database...");

    // ================= ROLES =================
    await pool.query(`
      INSERT INTO roles (role_name)
      VALUES 
        ('SUPER_ADMIN'),
        ('INSTITUTION_ADMIN'),
        ('REGISTRAR'),
        ('STAFF')
      ON CONFLICT (role_name) DO NOTHING;
    `);

    // ================= ACADEMIC LEVELS =================
    await pool.query(`
      INSERT INTO academic_levels (name)
      VALUES 
        ('PRIMARY'),
        ('SECONDARY'),
        ('HIGHER')
      ON CONFLICT (name) DO NOTHING;
    `);

    // ================= INSTITUTION =================
    await pool.query(`
      INSERT INTO institution (name, code, type)
      VALUES 
        ('Ministry of Education', 'MOE', 'GOVERNMENT_BODY'),
        ('Regional Exam Board', 'REB', 'EXAM_BOARD')
      ON CONFLICT (code) DO NOTHING;
    `);

    console.log("Seeding completed!");
  } catch (err) {
    console.error("Seed failed:", err.message);
  } finally {
    await pool.end();
  }
}

seed();
