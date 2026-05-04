import pool from "../../common/config/pool.js";

export const createQrToken = async ({ studentId, token, expiresAt }) => {
  const result = await pool.query(
    `INSERT INTO qr_tokens (student_id, token, expires_at)
     VALUES ($1, $2, $3)
     RETURNING id, student_id AS "studentId", token, expires_at AS "expiresAt", created_at AS "createdAt"`,
    [studentId, token, expiresAt],
  );
  return result.rows[0];
};

export const findQrTokenByToken = async (token) => {
  const result = await pool.query(
    `SELECT id, student_id AS "studentId", token, expires_at AS "expiresAt", created_at AS "createdAt"
     FROM qr_tokens
     WHERE token = $1`,
    [token],
  );
  return result.rows[0] || null;
};

export const findQrTokensByStudentId = async (studentId) => {
  const result = await pool.query(
    `SELECT id, token, expires_at AS "expiresAt", created_at AS "createdAt"
     FROM qr_tokens
     WHERE student_id = $1
     ORDER BY created_at DESC`,
    [studentId],
  );
  return result.rows;
};

export const deleteExpiredQrTokensByStudentId = async (studentId) => {
  await pool.query(
    `DELETE FROM qr_tokens
     WHERE student_id = $1 AND expires_at < CURRENT_TIMESTAMP`,
    [studentId],
  );
};

export const deleteQrTokenById = async (id, studentId) => {
  const result = await pool.query(
    `DELETE FROM qr_tokens
     WHERE id = $1 AND student_id = $2
     RETURNING id`,
    [id, studentId],
  );
  return result.rows[0] || null;
};

