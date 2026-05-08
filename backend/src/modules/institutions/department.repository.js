import pool from "../../common/config/pool.js";

export const findDepartmentById = async (id) => {
  const result = await pool.query(
    `SELECT id,
            college_id AS "collegeId",
            name,
            code,
            is_active AS "isActive",
            created_at AS "createdAt"
     FROM departments
     WHERE id = $1
     LIMIT 1`,
    [id],
  );

  return result.rows[0] || null;
};

export const findDepartments = async (collegeId) => {
  const params = [];
  let sql = `SELECT id,
                    college_id AS "collegeId",
                    name,
                    code,
                    is_active AS "isActive",
                    created_at AS "createdAt"
             FROM departments`;

  if (collegeId) {
    params.push(collegeId);
    sql += ` WHERE college_id = $1`;
  }

  sql += ` ORDER BY name ASC`;

  const result = await pool.query(sql, params);
  return result.rows;
};

export const findDepartmentByName = async (name, collegeId) => {
  const result = await pool.query(
    `SELECT id, name, code, is_active AS "isActive" FROM departments 
     WHERE LOWER(TRIM(name)) = LOWER(TRIM($1)) AND college_id = $2
     LIMIT 1`,
    [name, collegeId],
  );
  return result.rows[0] || null;
};

export const findDepartmentByCode = async (code, collegeId) => {
  const result = await pool.query(
    `SELECT id, name, code, is_active AS "isActive" FROM departments 
     WHERE UPPER(TRIM(code)) = UPPER(TRIM($1)) AND college_id = $2
     LIMIT 1`,
    [code, collegeId],
  );
  return result.rows[0] || null;
};

export const createDepartmentRecord = async ({ collegeId, name, code, isActive = true }) => {
  const result = await pool.query(
    `INSERT INTO departments (college_id, name, code, is_active)
     VALUES ($1, $2, $3, $4)
     RETURNING id,
               college_id AS "collegeId",
               name,
               code,
               is_active AS "isActive",
               created_at AS "createdAt"`,
    [collegeId, name, code, isActive],
  );
  return result.rows[0];
};

export const updateDepartmentById = async ({ id, name = null, code = null, isActive = null }) => {
  const result = await pool.query(
    `UPDATE departments
     SET name = COALESCE($2, name),
         code = COALESCE($3, code),
         is_active = COALESCE($4, is_active)
     WHERE id = $1
     RETURNING id,
               college_id AS "collegeId",
               name,
               code,
               is_active AS "isActive",
               created_at AS "createdAt"`,
    [id, name, code, isActive],
  );
  return result.rows[0] || null;
};

export const deleteDepartmentById = async (id) => {
  const result = await pool.query(
    `DELETE FROM departments WHERE id = $1 RETURNING id`,
    [id],
  );
  return result.rows[0] || null;
};
