import pool from "../../common/config/pool.js";

export const findCollegeById = async (id) => {
  const result = await pool.query(
    `SELECT id,
      institution_id AS "institutionId",
      name,
      code,
      is_active AS "isActive",
      created_at AS "createdAt"
     FROM colleges
     WHERE id = $1 AND is_deleted = false
     LIMIT 1`,
    [id],
  );

  return result.rows[0] || null;
};

export const findColleges = async (institutionId) => {
  const params = [];
  let sql = `SELECT id,
                    institution_id AS "institutionId",
                    name,
                    code,
                    is_active AS "isActive",
                    created_at AS "createdAt"
             FROM colleges
             WHERE is_deleted = false`;

  if (institutionId) {
    params.push(institutionId);
    sql += ` AND institution_id = $1`;
  }

  sql += ` ORDER BY name ASC`;

  const result = await pool.query(sql, params);
  return result.rows;
};

export const findCollegeByCodeAll = async (code, institutionId) => {
  const result = await pool.query(
    `SELECT id, institution_id AS "institutionId", name, code, is_deleted AS "isDeleted" 
     FROM colleges 
     WHERE UPPER(TRIM(code)) = UPPER(TRIM($1)) AND institution_id = $2
     LIMIT 1`,
    [code, institutionId],
  );
  return result.rows[0] || null;
};

export const findCollegeByCode = async (code, institutionId) => {
  const result = await pool.query(
    `SELECT id, name, code, is_active AS "isActive" FROM colleges 
     WHERE UPPER(TRIM(code)) = UPPER(TRIM($1)) AND institution_id = $2 AND is_deleted = false
     LIMIT 1`,
    [code, institutionId],
  );
  return result.rows[0] || null;
};

export const createCollegeRecord = async ({ institutionId, name, code, isActive = true }) => {
  const result = await pool.query(
    `INSERT INTO colleges (institution_id, name, code, is_active)
     VALUES ($1, $2, $3, $4)
     RETURNING id,
               institution_id AS "institutionId",
               name,
               code,
               is_active AS "isActive",
               created_at AS "createdAt"`,
    [institutionId, name, code, isActive],
  );
  return result.rows[0];
};

export const updateCollegeById = async ({ id, name = null, code = null, isActive = null }) => {
  const result = await pool.query(
    `UPDATE colleges
     SET name = COALESCE($2, name),
         code = COALESCE($3, code),
         is_active = COALESCE($4, is_active)
     WHERE id = $1
     RETURNING id,
               institution_id AS "institutionId",
               name,
               code,
               is_active AS "isActive",
               created_at AS "createdAt"`,
    [id, name, code, isActive],
  );
  return result.rows[0] || null;
};

export const deleteCollegeById = async (id) => {
  const result = await pool.query(
    `UPDATE colleges 
     SET is_deleted = true, 
         deleted_at = CURRENT_TIMESTAMP 
     WHERE id = $1 
     RETURNING id`,
    [id],
  );
  return result.rows[0] || null;
};

export const restoreCollegeById = async (id) => {
  const result = await pool.query(
    `UPDATE colleges 
     SET is_deleted = false, 
         deleted_at = NULL 
     WHERE id = $1 
     RETURNING id, name, code`,
    [id],
  );
  return result.rows[0] || null;
};
