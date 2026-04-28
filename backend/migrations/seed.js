import pool from "../src/common/config/pool.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();
async function seed() {
  try {
    console.log("Seeding database...");

    // ================= ROLES =================
    await pool.query(`
      INSERT INTO roles (role_name)
      VALUES 
        ('SUPER_ADMIN'),
        ('REGISTRAR')
      ON CONFLICT (role_name) DO NOTHING;
    `);

    // ================= INSTITUTION =================
    await pool.query(`
      INSERT INTO institution (name, code, type)
      VALUES 
      ('Ministry of Education', 'MOE', 'EXAM_BOARD'),
      ('Regional Exam Board', 'REB', 'EXAM_BOARD'),
      ('Central University', 'CC', 'COLLEGE')
      ON CONFLICT (code) DO NOTHING;
      `);

    // ================= COLLEGES =================
    await pool.query(`
      INSERT INTO colleges (institution_id, name, code)
      VALUES
        ((SELECT id FROM institution WHERE code = 'CC'), 'College of Engineering', 'COE'),
        ((SELECT id FROM institution WHERE code = 'CC'), 'College of Business and Economics', 'CBE')
      ON CONFLICT (institution_id, code) DO NOTHING;
    `);

    // ================= DEPARTMENTS =================
    await pool.query(`
      INSERT INTO departments (college_id, name, code)
      VALUES
        ((SELECT id FROM colleges WHERE code = 'COE'), 'Department of Computer Science', 'CS'),
        ((SELECT id FROM colleges WHERE code = 'COE'), 'Department of Civil Engineering', 'CE')
      ON CONFLICT (college_id, code) DO NOTHING;
    `);

    // ================= EXAM LEVELS =================
    await pool.query(`
      INSERT INTO exam_levels (code, name)
        VALUES 
          ('GRADE_6', 'Grade 6 Exam'),
          ('GRADE_8', 'Grade 8 Exam'),
          ('GRADE_12', 'Grade 12 Exam'),
          ('EXIT', 'Exit Exam')
        ON CONFLICT (code) DO NOTHING;
      `);

    // ================= DEGREE LEVELS =================
    await pool.query(`
  INSERT INTO degree_levels (code, name, rank)
  VALUES 
    ('BACHELOR', 'Bachelor Degree', 1),
    ('MASTER', 'Master Degree', 2),
    ('PHD', 'Doctorate (PhD)', 3)
  ON CONFLICT (code) DO NOTHING;
`);

    // ================= DEGREE TITLES =================
    await pool.query(`
      INSERT INTO degree_titles (degree_level_id, code, title)
      VALUES
        (1, 'BSC', 'Bachelor of Science (BSc)'),
        (1, 'BA', 'Bachelor of Arts (BA)'),
        (1, 'BENG', 'Bachelor of Engineering (BEng)'),
        (1, 'BBA', 'Bachelor of Business Administration (BBA)'),
        (2, 'MSC', 'Master of Science (MSc)'),
        (2, 'MA', 'Master of Arts (MA)'),
        (2, 'MBA', 'Master of Business Administration (MBA)'),
        (3, 'PHD', 'Doctor of Philosophy (PhD)')
      ON CONFLICT (code) DO NOTHING;
    `);

    // ================= RECORD TYPES =================
    await pool.query(`
      INSERT INTO record_types (name)
      VALUES 
        ('EXAM'),
        ('DEGREE')
      ON CONFLICT (name) DO NOTHING;
    `);

    // =================INSERT SUPER ADMIN =================
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

    if (!superAdminEmail || !superAdminPassword) {
      throw new Error(
        "SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD are required",
      );
    }

    // 1. Ensure role exists
    const roleResult = await pool.query(
      `SELECT id FROM roles WHERE role_name = 'SUPER_ADMIN'`,
    );

    if (roleResult.rowCount === 0) {
      throw new Error("SUPER_ADMIN role not found");
    }

    const roleId = roleResult.rows[0].id;

    // 2. Hash password
    const passwordHash = await bcrypt.hash(superAdminPassword, 10);

    // 3. Insert or update super admin
    await pool.query(
      `
  INSERT INTO app_user (
    first_name,
    last_name,
    email,
    password_hash,
    is_active,
    role_id,
    institution_id
  )
  VALUES ($1, $2, $3, $4, TRUE, $5, NULL)
  ON CONFLICT (email) DO UPDATE
  SET
    password_hash = EXCLUDED.password_hash,
    role_id = EXCLUDED.role_id,
    is_active = TRUE,
    institution_id = NULL,
    updated_at = CURRENT_TIMESTAMP;
  `,
      ["Super", "Admin", superAdminEmail, passwordHash, roleId],
    );

    // =================INSERT REGISTRAR =================
    await pool.query(
      `
  INSERT INTO app_user (
    first_name,
    last_name,
    email,
    password_hash,
    is_active,
    role_id,
    institution_id
  )
  VALUES ($1, $2, $3, $4, TRUE, (SELECT id FROM roles WHERE role_name = 'REGISTRAR'), (SELECT id FROM institution WHERE code = 'REB'))
  ON CONFLICT (email) DO UPDATE
  SET
    password_hash = EXCLUDED.password_hash,
    role_id = EXCLUDED.role_id,
    is_active = TRUE,
    institution_id = EXCLUDED.institution_id,
    updated_at = CURRENT_TIMESTAMP;
  `,
      ["John", "Doe", "john.doe@example.com", passwordHash],
    );

    console.log("Seeding completed!");
  } catch (err) {
    console.error("Seed failed:", err?.message || err);
    if (err && !err.message) {
      console.error(err);
    }
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seed();
