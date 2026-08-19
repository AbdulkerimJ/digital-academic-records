import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DB_URL,
  // we do not use ssl for local
  ssl: { rejectUnauthorized: false }
});

export default pool;