import pool from "../../common/config/pool.js";

export const findInstitutionByCodeAll = async (code) => {
  const result = await pool.query(
    `SELECT id, name, code, is_deleted AS "isDeleted"
     FROM institution
     WHERE UPPER(TRIM(code)) = UPPER(TRIM($1))`,
    [code],
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
     WHERE id = $1 AND is_deleted = false
     LIMIT 1`,
    [id],
  );

  return result.rows[0] || null;
};

export const findInstitutions = async ({
  limit = 10,
  offset = 0,
  search = '',
  type = 'all',
  status = 'all',
  sortBy = 'name',
  sortDir = 'ASC'
} = {}) => {
  const params = [];
  let query = `
    SELECT i.id,
           i.name,
           i.code,
           i.type,
           it.name AS "typeName",
           i.is_active AS "isActive",
           i.created_at AS "createdAt",
           COUNT(*) OVER() AS "totalCount"
    FROM institution i
    LEFT JOIN institution_types it ON i.type = it.code
    WHERE is_deleted = false
  `;

  if (search && search.trim()) {
    params.push(`%${search.trim().toLowerCase()}%`);
    query += ` AND (LOWER(i.name) LIKE $${params.length} OR LOWER(i.code) LIKE $${params.length})`;
  }

  if (type !== 'all') {
    params.push(type);
    query += ` AND i.type = $${params.length}`;
  }

  if (status !== 'all') {
    const isActive = status === 'ACTIVE';
    params.push(isActive);
    query += ` AND i.is_active = $${params.length}`;
  }

  // Sorting
  const allowedSortFields = ['name', 'code', 'type', 'createdAt'];
  const actualSortField = allowedSortFields.includes(sortBy) ? `i.${sortBy === 'createdAt' ? 'created_at' : sortBy}` : 'i.name';
  const actualSortDir = ['ASC', 'DESC'].includes(sortDir.toUpperCase()) ? sortDir.toUpperCase() : 'ASC';
  
  query += ` ORDER BY ${actualSortField} ${actualSortDir}`;

  // Pagination
  params.push(limit);
  query += ` LIMIT $${params.length}`;
  params.push(offset);
  query += ` OFFSET $${params.length}`;

  const result = await pool.query(query, params);
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

export const getInstitutionTypes = async () => {
  const result = await pool.query(
    `SELECT code, name FROM institution_types WHERE is_active = true ORDER BY name ASC`,
  );
  return result.rows;
};

export const deleteInstitutionRecord = async (id) => {
  const result = await pool.query(
    `UPDATE institution 
     SET is_deleted = true, 
         deleted_at = CURRENT_TIMESTAMP 
     WHERE id = $1 
     RETURNING id`,
    [id],
  );
  return result.rows[0] || null;
};

export const restoreInstitutionById = async (id) => {
  const result = await pool.query(
    `UPDATE institution 
     SET is_deleted = false, 
         deleted_at = NULL 
     WHERE id = $1 
     RETURNING id, name, code`,
    [id],
  );
  return result.rows[0] || null;
};
