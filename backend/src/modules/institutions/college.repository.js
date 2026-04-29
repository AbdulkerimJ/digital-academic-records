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
     WHERE id = $1
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
             FROM colleges`;

  if (institutionId) {
    params.push(institutionId);
    sql += ` WHERE institution_id = $1`;
  }

  sql += ` ORDER BY name ASC`;

  const result = await pool.query(sql, params);
  return result.rows;
};

export const findCollegeByName = async (name, institutionId) => {
  const result = await pool.query(
    `SELECT id, name, code FROM colleges 
     WHERE LOWER(TRIM(name)) = LOWER(TRIM($1)) AND institution_id = $2
     LIMIT 1`,
    [name, institutionId],
  );
  return result.rows[0] || null;
};

export const findCollegeByCode = async (code, institutionId) => {
  const result = await pool.query(
    `SELECT id, name, code FROM colleges 
     WHERE UPPER(TRIM(code)) = UPPER(TRIM($1)) AND institution_id = $2
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
    `DELETE FROM colleges WHERE id = $1 RETURNING id`,
    [id],
  );
  return result.rows[0] || null;
};
