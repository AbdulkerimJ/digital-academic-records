import pool from "../src/common/config/pool.js";

async function migrate() {
  try {
    console.log("🚀 Running migrations...");

    // Enable UUID generation
    await pool.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

    // ===================== ROLES =====================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        role_name TEXT UNIQUE NOT NULL
      );
    `);

    // ===================== INSTITUTION =====================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS institution (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,

        type TEXT NOT NULL CHECK (
          type IN (
            'GOVERNMENT_BODY',
            'EXAM_BOARD',
            'UNIVERSITY',
            'COLLEGE',
            'REGIONAL_OFFICE',
            'OTHER'
          )
        ),

        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ===================== STUDENT =====================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS student (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        national_id TEXT UNIQUE NOT NULL,

        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        date_of_birth DATE NOT NULL,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ===================== USER =====================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS app_user (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,

    -- ACCOUNT LIFECYCLE
    is_active BOOLEAN DEFAULT FALSE,

    -- INVITE FLOW (admin → user activation)
    invitation_token TEXT,
    invitation_expires TIMESTAMP,

    -- PASSWORD RESET FLOW
    reset_token TEXT,
    reset_expires TIMESTAMP,

    -- SECURITY
    password_changed_at TIMESTAMP,

    role_id INT NOT NULL,
    institution_id UUID,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (institution_id)
        REFERENCES institution(id)
        ON DELETE RESTRICT,

    CONSTRAINT check_institution_for_non_super_admin
    CHECK (
        (role_id = 1 AND institution_id IS NULL) OR
        (role_id != 1 AND institution_id IS NOT NULL)
    )
);
    `);

    // ===================== ACADEMIC LEVELS =====================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS academic_levels (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL
      );
    `);

    // ===================== ACADEMIC RECORD =====================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS academic_record (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        student_id UUID NOT NULL,
        institution_id UUID NOT NULL,
        level_id INT NOT NULL,

        field_of_study TEXT,
        score FLOAT,
        year INT,

        status TEXT NOT NULL DEFAULT 'PENDING' CHECK (
          status IN ('PENDING', 'VERIFIED', 'REJECTED')
        ),

        qr_hash TEXT UNIQUE,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (student_id)
          REFERENCES student(id)
          ON DELETE CASCADE,

        FOREIGN KEY (institution_id)
          REFERENCES institution(id),

        FOREIGN KEY (level_id)
          REFERENCES academic_levels(id)
      );
    `);

    // ===================== CORRECTION REQUEST =====================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS correction_request (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        student_id UUID NOT NULL,
        academic_record_id UUID NOT NULL,

        request_text TEXT NOT NULL,

        status TEXT NOT NULL DEFAULT 'PENDING' CHECK (
          status IN ('PENDING', 'APPROVED', 'REJECTED')
        ),

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (student_id)
          REFERENCES student(id)
          ON DELETE CASCADE,

        FOREIGN KEY (academic_record_id)
          REFERENCES academic_record(id)
          ON DELETE CASCADE
      );
    `);

    // ===================== AUDIT LOG =====================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        actor_id UUID,
        action TEXT NOT NULL,

        target_table TEXT,
        target_id UUID,

        ip_address TEXT,
        user_agent TEXT,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Migration completed successfully!");
  } catch (err) {
    console.error("Migration failed:", err.message);
  } finally {
    await pool.end();
  }
}

migrate();
