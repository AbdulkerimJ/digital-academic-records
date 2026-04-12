import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  try {
    // Citizen table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS citizen (
        fayda_id VARCHAR(12) PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        father_name VARCHAR(100) NOT NULL,
        grandfather_name VARCHAR(100) NOT NULL,
        phone_number VARCHAR(20) UNIQUE NOT NULL,
        dob DATE NOT NULL,
        gender VARCHAR(10) NOT NULL,
        nationality VARCHAR(50) DEFAULT 'Ethiopian',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // OTP table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS otp_codes (
        id SERIAL PRIMARY KEY,
        fayda_id VARCHAR(12) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        expires_at BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log("✓ All tables created successfully.");
  } catch (err) {
    console.error("✗ Migration failed:", err.message);
  } finally {
    await pool.end();
  }
}

migrate();