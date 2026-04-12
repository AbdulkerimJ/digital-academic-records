import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

import citizens from "./citizensData.js";

const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

async function insertData() {
  try {
    for (const citizen of citizens) {
      await pool.query(
        `INSERT INTO citizen 
        (fayda_id, first_name, father_name, grandfather_name, phone_number, dob, gender)
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        ON CONFLICT (fayda_id) DO NOTHING`,
        [
          citizen.faydaId,
          citizen.firstName,
          citizen.fatherName,
          citizen.grandfatherName,
          citizen.phoneNumber,
          citizen.dob,
          citizen.gender,
        ]
      );
    }

    console.log(`✓ ${citizens.length} citizens processed.`);
  } catch (err) {
    console.error("✗ Error inserting data:", err.message);
  } finally {
    await pool.end();
  }
}

insertData();