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
            'EXAM_BOARD',
            'COLLEGE'
          )
        ),

        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ===================== COLLEGES =====================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS colleges (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        institution_id UUID NOT NULL,
        name TEXT NOT NULL,
        code TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (institution_id)
          REFERENCES institution(id)
          ON DELETE CASCADE,

        UNIQUE (institution_id, code),
        UNIQUE (institution_id, name)
      );
    `);

    // ===================== DEPARTMENTS =====================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        college_id UUID NOT NULL,
        name TEXT NOT NULL,
        code TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (college_id)
          REFERENCES colleges(id)
          ON DELETE CASCADE,

        UNIQUE (college_id, code),
        UNIQUE (college_id, name)
      );
    `);

    // ===================== EXAM LEVELS =====================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS exam_levels (
        id SERIAL PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ===================== RECORD TYPES =====================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS record_types (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ===================== DEGREE TYPES =====================
    await pool.query(`
    CREATE TABLE IF NOT EXISTS degree_levels (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  rank INT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
    `);

    // ===================== DEGREE TITLES =====================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS degree_titles (
        id SERIAL PRIMARY KEY,
        degree_level_id INT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (degree_level_id)
          REFERENCES degree_levels(id)
          ON DELETE CASCADE,

        UNIQUE (degree_level_id, code)
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
        token_version INT NOT NULL DEFAULT 0,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ===================== EXAM RECORDS =====================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS exams (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        student_id UUID NOT NULL,
        exam_level_id INT NOT NULL,
        institution_id UUID NOT NULL,

        year INT NOT NULL,

        total_score FLOAT,
        average_score FLOAT,
        percentile FLOAT,

        result_status TEXT NOT NULL CHECK (
          result_status IN ('PASS', 'FAIL')
      ),

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        -- Relationships
        FOREIGN KEY (student_id)
          REFERENCES student(id)
          ON DELETE RESTRICT,

      FOREIGN KEY (exam_level_id)
        REFERENCES exam_levels(id)
        ON DELETE RESTRICT,

      FOREIGN KEY (institution_id)
        REFERENCES institution(id)
        ON DELETE RESTRICT,

      -- Prevent duplicates
      UNIQUE (student_id, exam_level_id, year, institution_id),

        -- Ensure at least one score exists
        CHECK (
          total_score IS NOT NULL OR
          average_score IS NOT NULL OR
          percentile IS NOT NULL
        )
          );
  `);

    // ===================== DEGREE RECORD =====================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS degrees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  student_id UUID NOT NULL,
  institution_id UUID NOT NULL,
  degree_level_id INT NOT NULL,
  degree_title_id INT NOT NULL,
  college_id UUID NOT NULL,
  department_id UUID NOT NULL,
  cgpa FLOAT,
  graduation_date DATE NOT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Relationships
  FOREIGN KEY (student_id)
    REFERENCES student(id)
    ON DELETE RESTRICT,

  FOREIGN KEY (institution_id)
    REFERENCES institution(id)
    ON DELETE RESTRICT,

  FOREIGN KEY (degree_level_id)
    REFERENCES degree_levels(id)
    ON DELETE RESTRICT,

  FOREIGN KEY (degree_title_id)
    REFERENCES degree_titles(id)
    ON DELETE RESTRICT,

  FOREIGN KEY (college_id)
    REFERENCES colleges(id)
    ON DELETE RESTRICT,

  FOREIGN KEY (department_id)
    REFERENCES departments(id)
    ON DELETE RESTRICT,

  -- Prevent duplicate degrees
  UNIQUE (student_id, degree_level_id, degree_title_id, institution_id, graduation_date)
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
    is_suspended BOOLEAN DEFAULT FALSE,
    suspended_at TIMESTAMP,
    suspended_by UUID,
    suspension_reason TEXT,

    -- INVITE FLOW (admin → user activation)
    invitation_token TEXT,
    invitation_expires TIMESTAMP,

    -- PASSWORD RESET FLOW
    reset_token TEXT,
    reset_expires TIMESTAMP,

    -- SECURITY
    password_changed_at TIMESTAMP,
    token_version INT NOT NULL DEFAULT 0,

    role_id INT NOT NULL,
    institution_id UUID,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (institution_id)
        REFERENCES institution(id)
        ON DELETE RESTRICT,
    FOREIGN KEY (suspended_by)
      REFERENCES app_user(id)
      ON DELETE SET NULL,

    CONSTRAINT check_institution_for_non_super_admin
    CHECK (
        (role_id = 1 AND institution_id IS NULL) OR
        (role_id != 1 AND institution_id IS NOT NULL)
    )
);
    `);

    // ===================== CORRECTION REQUEST =====================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS correction_request (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        student_id UUID NOT NULL,
        institution_id UUID NOT NULL,

        request_text TEXT NOT NULL,


        status TEXT NOT NULL DEFAULT 'PENDING' CHECK (
          status IN ('PENDING', 'APPROVED', 'REJECTED')
        ),

        reviewed_by UUID,
        reviewed_at TIMESTAMP,
        rejection_reason TEXT,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (student_id)
          REFERENCES student(id)
          ON DELETE CASCADE,

        FOREIGN KEY (reviewed_by)
          REFERENCES app_user(id)
          ON DELETE SET NULL,

        FOREIGN KEY (institution_id)
          REFERENCES institution(id)
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
    console.error("Migration failed:", err?.message || err);
    if (err && !err.message) {
      console.error(err);
    }
  } finally {
    await pool.end();
  }
}

migrate();
