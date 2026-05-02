import pool from "../../common/config/pool.js";

export const findDegreeLevelById = async (id) => {
  const result = await pool.query(
    `SELECT id,
            code,
            name,
            rank,
            is_active AS "isActive",
            created_at AS "createdAt"
     FROM degree_levels
     WHERE id = $1
     LIMIT 1`,
    [id],
  );

  return result.rows[0] || null;
};

export const findDegreeLevels = async () => {
  const result = await pool.query(
    `SELECT id,
            code,
            name,
            rank,
            is_active AS "isActive",
            created_at AS "createdAt"
     FROM degree_levels
     ORDER BY rank ASC`,
  );

  return result.rows;
};

export const createDegreeLevelRecord = async ({ code, name, rank, isActive = true }) => {
  const result = await pool.query(
    `INSERT INTO degree_levels (code, name, rank, is_active)
     VALUES ($1, $2, $3, $4)
     RETURNING id, code, name, rank, is_active AS "isActive", created_at AS "createdAt"`,
    [code.toUpperCase(), name, rank, isActive],
  );
  return result.rows[0];
};

export const updateDegreeLevelById = async ({ id, code = null, name = null, rank = null, isActive = null }) => {
  const result = await pool.query(
    `UPDATE degree_levels
     SET code = COALESCE($2, code),
         name = COALESCE($3, name),
         rank = COALESCE($4, rank),
         is_active = COALESCE($5, is_active)
     WHERE id = $1
     RETURNING id, code, name, rank, is_active AS "isActive", created_at AS "createdAt"`,
    [id, code ? code.toUpperCase() : null, name, rank, isActive],
  );
  return result.rows[0] || null;
};

export const findDegreeLevelByCode = async (code) => {
  const result = await pool.query(
    `SELECT id, code, name, rank, is_active AS "isActive"
     FROM degree_levels
     WHERE UPPER(TRIM(code)) = UPPER(TRIM($1))
     LIMIT 1`,
    [code],
  );
  return result.rows[0] || null;
};

