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

    // ===================== INSTITUTION TYPES =====================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS institution_types (
        id SERIAL PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ===================== INSTITUTION =====================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS institution (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        code TEXT NOT NULL,
        type TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        is_deleted BOOLEAN DEFAULT false,
        deleted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (type) REFERENCES institution_types(code)
      );

      CREATE UNIQUE INDEX IF NOT EXISTS institution_code_idx 
      ON institution (code) 
      WHERE is_deleted = false;
    `);

    // ===================== COLLEGES =====================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS colleges (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        institution_id UUID NOT NULL,
        name TEXT NOT NULL,
        code TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        is_deleted BOOLEAN DEFAULT false,
        deleted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (institution_id)
          REFERENCES institution(id)
          ON DELETE CASCADE
      );

      CREATE UNIQUE INDEX IF NOT EXISTS colleges_institution_id_code_idx 
      ON colleges (institution_id, code) 
      WHERE is_deleted = false;
    `);

    // ===================== DEPARTMENTS =====================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        college_id UUID NOT NULL,
        name TEXT NOT NULL,
        code TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        is_deleted BOOLEAN DEFAULT false,
        deleted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (college_id)
          REFERENCES colleges(id)
          ON DELETE CASCADE
      );

      CREATE UNIQUE INDEX IF NOT EXISTS departments_college_id_code_idx 
      ON departments (college_id, code) 
      WHERE is_deleted = false;
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

    // ===================== DEGREE LEVELS =====================
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
        national_id TEXT NOT NULL,

        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        gender TEXT,
        date_of_birth DATE NOT NULL,
        token_version INT NOT NULL DEFAULT 0,

        is_deleted BOOLEAN DEFAULT false,
        deleted_at TIMESTAMP,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE UNIQUE INDEX IF NOT EXISTS student_national_id_idx 
      ON student (national_id) 
      WHERE is_deleted = false;
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

        is_deleted BOOLEAN DEFAULT false,
        deleted_at TIMESTAMP,

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

        -- Ensure at least one score exists
        CHECK (
          total_score IS NOT NULL OR
          average_score IS NOT NULL OR
          percentile IS NOT NULL
        )
      );

      CREATE UNIQUE INDEX IF NOT EXISTS exams_student_id_exam_level_id_year_institution_idx 
      ON exams (student_id, exam_level_id, year, institution_id) 
      WHERE is_deleted = false;
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

        is_deleted BOOLEAN DEFAULT false,
        deleted_at TIMESTAMP,

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
          ON DELETE RESTRICT
      );

      CREATE UNIQUE INDEX IF NOT EXISTS degrees_student_id_level_title_inst_idx 
      ON degrees (student_id, degree_level_id, degree_title_id, institution_id) 
      WHERE is_deleted = false;
    `);

    // ===================== USER =====================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS app_user (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
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

        is_deleted BOOLEAN DEFAULT false,
        deleted_at TIMESTAMP,

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

      CREATE UNIQUE INDEX IF NOT EXISTS app_user_email_idx 
      ON app_user (email) 
      WHERE is_deleted = false;
    `);

    // ===================== CORRECTION REQUEST =====================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS correction_request (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        student_id UUID NOT NULL,
        institution_id UUID NOT NULL,

        record_id UUID,
        record_type TEXT CHECK (record_type IN ('EXAM', 'DEGREE')),

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

    // ===================== AUDIT LOGS =====================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        user_id UUID,
        institution_id UUID,
        
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT,

        old_values JSONB,
        new_values JSONB,

        ip_address TEXT,
        user_agent TEXT,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE SET NULL,
        FOREIGN KEY (institution_id) REFERENCES institution(id) ON DELETE CASCADE
      );
    `);

    // ===================== QR TOKENS =====================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS qr_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        student_id UUID NOT NULL REFERENCES student(id) ON DELETE CASCADE,

        token TEXT NOT NULL UNIQUE,

        expires_at TIMESTAMP NOT NULL,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ===================== SUPPORT SYSTEM =====================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS support_request (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RESOLVED')),
        response TEXT,
        responded_at TIMESTAMP,
        is_deleted BOOLEAN DEFAULT false,
        deleted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
