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
      ('Central College', 'CC', 'COLLEGE')
      ON CONFLICT (code) DO NOTHING;
      `);

    // ================= EXAM TYPES =================
    await pool.query(`
        INSERT INTO exam_types (code, name)
        VALUES 
          ('GRADE_6', 'Grade 6 Exam'),
          ('GRADE_8', 'Grade 8 Exam'),
          ('GRADE_12', 'Grade 12 Exam'),
          ('EXIT', 'Exit Exam')
        ON CONFLICT (code) DO NOTHING;
      `);

    // ================= RECORD TYPES =================
    await pool.query(`
      INSERT INTO record_types (name)
      VALUES 
        ('EXAM'),
        ('CERTIFICATE')
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
    // use demy data for registrar
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
    console.error("Seed failed:", err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seed();
