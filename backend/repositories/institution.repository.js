import pool from "../config/pool.js";

export const findInstitutionByName = async (name) => {
  const result = await pool.query(
    `SELECT id,
            name,
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

export const createInstitutionRecord = async ({
  name,
  type,
  isActive = true,
}) => {
  const result = await pool.query(
    `INSERT INTO institution (name, type, is_active)
     VALUES ($1, $2, $3)
     RETURNING id,
               name,
               type,
               is_active AS "isActive",
               created_at AS "createdAt"`,
    [name, type, isActive],
  );

  return result.rows[0];
};
