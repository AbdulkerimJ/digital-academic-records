import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

import { citizens } from "./citizensData.js";
import pool from "./pool.js";
async function insertData() {
  try {
    for (const citizen of citizens) {
      try {
        await pool.query(
          `INSERT INTO citizen 
          (fayda_id, first_name, father_name, grand_father_name, phone_number, date_of_birth, gender)
          VALUES ($1,$2,$3,$4,$5,$6,$7)
          ON CONFLICT (fayda_id) DO NOTHING`,
          [
            citizen.fan_number?.toString(),
            citizen.first_name,
            citizen.father_name,
            citizen.grand_father_name,
            citizen.phone_number?.toString(),
            citizen.date_of_birth,
            citizen.gender,
          ],
        );
      } catch (err) {
        console.error("✗ Failed record:", citizen);
        console.error("✗ Error inserting data:", err.message);
      }
    }

    console.log(`✓ ${citizens.length} citizens processed.`);
  } catch (err) {
    console.error("✗ Error inserting data:", err.message);
  } finally {
    await pool.end();
  }
}

insertData();
