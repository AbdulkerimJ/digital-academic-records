import pool from "../../common/config/pool.js";

export const createSupportRequestRecord = async ({ email, subject, message }) => {
  const query = `
    INSERT INTO support_request (email, subject, message)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [email, subject, message]);
  return rows[0];
};

export const findSupportRequests = async ({ status }) => {
  let query = `SELECT * FROM support_request WHERE is_deleted = false`;
  const params = [];

  if (status) {
    params.push(status);
    query += ` AND status = $${params.length}`;
  }

  query += ` ORDER BY created_at DESC`;

  const { rows } = await pool.query(query, params);
  return rows;
};

export const findSupportRequestById = async (id) => {
  const query = `SELECT * FROM support_request WHERE id = $1 AND is_deleted = false;`;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

export const updateSupportResponseRecord = async (id, { response, status }) => {
  const query = `
    UPDATE support_request 
    SET response = $1, status = $2, responded_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
    WHERE id = $3 AND is_deleted = false
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [response, status, id]);
  return rows[0];
};

export const softDeleteSupportRequestRecord = async (id) => {
  const query = `
    UPDATE support_request 
    SET is_deleted = true, deleted_at = CURRENT_TIMESTAMP 
    WHERE id = $1 
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};
