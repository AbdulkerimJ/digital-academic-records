import pool from "../../common/config/pool.js";

export const findDegreeTitleById = async (id) => {
  const result = await pool.query(
    `SELECT dt.id,
            dt.degree_level_id AS "degreeLevelId",
            dl.name AS "levelName",
            dt.code,
            dt.title,
            dt.is_active AS "isActive",
            dt.created_at AS "createdAt"
     FROM degree_titles dt
     JOIN degree_levels dl ON dt.degree_level_id = dl.id
     WHERE dt.id = $1
     LIMIT 1`,
    [id],
  );

  return result.rows[0] || null;
};

export const findDegreeTitlesByLevelId = async (degreeLevelId) => {
  const result = await pool.query(
    `SELECT dt.id,
            dt.degree_level_id AS "degreeLevelId",
            dl.name AS "levelName",
            dt.code,
            dt.title,
            dt.is_active AS "isActive",
            dt.created_at AS "createdAt"
     FROM degree_titles dt
     JOIN degree_levels dl ON dt.degree_level_id = dl.id
     WHERE dt.degree_level_id = $1
     ORDER BY dt.code ASC`,
    [degreeLevelId],
  );

  return result.rows;
};

export const findDegreeTitles = async () => {
  const result = await pool.query(
    `SELECT dt.id,
            dt.degree_level_id AS "degreeLevelId",
            dl.name AS "levelName",
            dt.code,
            dt.title,
            dt.is_active AS "isActive",
            dt.created_at AS "createdAt"
     FROM degree_titles dt
     JOIN degree_levels dl ON dt.degree_level_id = dl.id
     ORDER BY dt.code ASC`,
  );

  return result.rows;
};

export const createDegreeTitleRecord = async ({ degreeLevelId, code, title, isActive = true }) => {
  const result = await pool.query(
    `INSERT INTO degree_titles (degree_level_id, code, title, is_active)
     VALUES ($1, $2, $3, $4)
     RETURNING id, degree_level_id AS "degreeLevelId", code, title, is_active AS "isActive", created_at AS "createdAt"`,
    [degreeLevelId, code.toUpperCase(), title, isActive],
  );
  return result.rows[0];
};

export const updateDegreeTitleById = async ({ id, degreeLevelId = null, code = null, title = null, isActive = null }) => {
  const result = await pool.query(
    `UPDATE degree_titles
     SET degree_level_id = COALESCE($2, degree_level_id),
         code = COALESCE($3, code),
         title = COALESCE($4, title),
         is_active = COALESCE($5, is_active)
     WHERE id = $1
     RETURNING id, degree_level_id AS "degreeLevelId", code, title, is_active AS "isActive", created_at AS "createdAt"`,
    [id, degreeLevelId, code ? code.toUpperCase() : null, title, isActive],
  );
  return result.rows[0] || null;
};
export const findDegreeTitleByCode = async (code) => {
  const result = await pool.query(
    `SELECT dt.id, 
            dt.degree_level_id AS "degreeLevelId", 
            dl.name AS "levelName",
            dt.code, 
            dt.title, 
            dt.is_active AS "isActive"
     FROM degree_titles dt
     JOIN degree_levels dl ON dt.degree_level_id = dl.id
     WHERE UPPER(TRIM(dt.code)) = UPPER(TRIM($1))
     LIMIT 1`,
    [code],
  );
  return result.rows[0] || null;
};
