import pool from "../../common/config/pool.js";

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

export const findInstitutionById = async (id) => {
  const result = await pool.query(
    `SELECT id,
            name,
            code,
            type,
            is_active AS "isActive",
            created_at AS "createdAt"
     FROM institution
     WHERE id = $1
     LIMIT 1`,
    [id],
  );

  return result.rows[0] || null;
};

export const findInstitutions = async () => {
  const result = await pool.query(
    `SELECT id,
            name,
            code,
            type,
            is_active AS "isActive",
            created_at AS "createdAt"
     FROM institution
     ORDER BY name ASC`,
  );

  return result.rows;
};

export const updateInstitutionById = async ({
  id,
  name = null,
  code = null,
  type = null,
  isActive = null,
}) => {
  const result = await pool.query(
    `UPDATE institution
     SET name = COALESCE($2, name),
         code = COALESCE($3, code),
         type = COALESCE($4, type),
         is_active = COALESCE($5, is_active)
     WHERE id = $1
     RETURNING id,
               name,
               code,
               type,
               is_active AS "isActive",
               created_at AS "createdAt"`,
    [id, name, code, type, isActive],
  );

  return result.rows[0] || null;
};
