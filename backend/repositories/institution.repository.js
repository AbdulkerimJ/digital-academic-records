import pool from "../config/pool.js";

export const findInstitutionByName = async (name) => {
  const result = await pool.query(
    `SELECT id,
            name,
            code,
            type,
            is_active AS "isActive",
            created_at AS "createdAt"
     FROM institution
     WHERE LOWER(TRIM(name)) = LOWER(TRIM($1))
     LIMIT 1`,
    [name],
  );

  return result.rows[0] || null;
};

export const findInstitutionByCode = async (code) => {
  const result = await pool.query(
    `SELECT id,
            name,
            code,
            type,
            is_active AS "isActive",
            created_at AS "createdAt"
     FROM institution
     WHERE UPPER(TRIM(code)) = UPPER(TRIM($1))
     LIMIT 1`,
    [code],
  );

  return result.rows[0] || null;
};

export const createInstitutionRecord = async ({
  name,
  code,
  type,
  isActive = true,
}) => {
  const result = await pool.query(
    `INSERT INTO institution (name, code, type, is_active)
     VALUES ($1, $2, $3, $4)
     RETURNING id,
               name,
               code,
               type,
               is_active AS "isActive",
               created_at AS "createdAt"`,
    [name, code, type, isActive],
  );

  return result.rows[0];
};
