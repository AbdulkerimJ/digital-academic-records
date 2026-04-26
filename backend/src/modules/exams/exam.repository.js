import pool from "../../common/config/pool.js";

export const findExamTypeByCode = async (code) => {
  const result = await pool.query(
    `SELECT id, code, name, is_active AS "isActive", created_at AS "createdAt"
     FROM exam_types
     WHERE UPPER(TRIM(code)) = UPPER(TRIM($1))
     LIMIT 1`,
    [code],
  );

  return result.rows[0] || null;
};

export const findExamTypeById = async (id) => {
  const result = await pool.query(
    `SELECT id, code, name, is_active AS "isActive", created_at AS "createdAt"
     FROM exam_types
     WHERE id = $1
     LIMIT 1`,
    [id],
  );

  return result.rows[0] || null;
};

export const findExamTypes = async () => {
  const result = await pool.query(
    `SELECT id,
            code,
            name,
            is_active AS "isActive",
            created_at AS "createdAt"
     FROM exam_types
     ORDER BY code ASC`,
  );

  return result.rows;
};

export const createExamTypeRecord = async ({ code, name, isActive }) => {
  const result = await pool.query(
    `INSERT INTO exam_types (code, name, is_active)
     VALUES ($1, $2, $3)
     RETURNING id, code, name, is_active AS "isActive", created_at AS "createdAt"`,
    [code, name, isActive],
  );

  return result.rows[0];
};

export const updateExamTypeById = async ({
  id,
  code = null,
  name = null,
  isActive = null,
}) => {
  const result = await pool.query(
    `UPDATE exam_types
     SET code = COALESCE($2, code),
         name = COALESCE($3, name),
         is_active = COALESCE($4, is_active)
     WHERE id = $1
     RETURNING id, code, name, is_active AS "isActive", created_at AS "createdAt"`,
    [id, code, name, isActive],
  );

  return result.rows[0] || null;
};

export const createExamRecordRecord = async ({
  studentId,
  examTypeId,
  institutionId,
  year,
  totalScore = null,
  averageScore = null,
  percentile = null,
  resultStatus,
}) => {
  const result = await pool.query(
    `INSERT INTO exams (
      student_id,
      exam_type_id,
      institution_id,
      year,
      total_score,
      average_score,
      percentile,
      result_status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id`,
    [
      studentId,
      examTypeId,
      institutionId,
      year,
      totalScore,
      averageScore,
      percentile,
      resultStatus,
    ],
  );

  return result.rows[0];
};

export const findExamRecordById = async (id) => {
  const result = await pool.query(
    `SELECT e.id,
            e.student_id AS "studentId",
            e.exam_type_id AS "examTypeId",
            et.code AS "examTypeCode",
            et.name AS "examTypeName",
            e.institution_id AS "institutionId",
            e.year,
            e.total_score AS "totalScore",
            e.average_score AS "averageScore",
            e.percentile,
            e.result_status AS "resultStatus",
            e.created_at AS "createdAt",
            e.updated_at AS "updatedAt"
     FROM exams e
     JOIN exam_types et ON e.exam_type_id = et.id
     WHERE e.id = $1
     LIMIT 1`,
    [id],
  );

  return result.rows[0] || null;
};

export const findExamRecords = async (query = {}, pagination = {}) => {
  let sql = `
    SELECT 
      e.id,
      e.student_id AS "studentId",
      e.exam_type_id AS "examTypeId",
      et.code AS "examTypeCode",
      et.name AS "examTypeName",
      e.institution_id AS "institutionId",
      e.year,
      e.total_score AS "totalScore",
      e.average_score AS "averageScore",
      e.percentile,
      e.result_status AS "resultStatus",
      e.created_at AS "createdAt",
      e.updated_at AS "updatedAt"
    FROM exams e
    JOIN exam_types et ON e.exam_type_id = et.id
  `;

  const conditions = [];
  const params = [];

  const { institutionId, examTypeCode, year, studentId } = query;
  const { page = 1, limit = 10 } = pagination;

  const offset = (page - 1) * limit;

  if (institutionId) {
    params.push(institutionId);
    conditions.push(`e.institution_id = $${params.length}`);
  }

  if (examTypeCode) {
    params.push(examTypeCode);
    conditions.push(`et.code = $${params.length}`);
  }

  if (year) {
    params.push(year);
    conditions.push(`e.year = $${params.length}`);
  }

  if (studentId) {
    params.push(studentId);
    conditions.push(`e.student_id = $${params.length}`);
  }

  if (conditions.length > 0) {
    sql += ` WHERE ` + conditions.join(" AND ");
  }

  sql += ` ORDER BY e.created_at DESC`;

  // pagination
  params.push(limit);
  const limitIndex = params.length;

  params.push(offset);
  const offsetIndex = params.length;

  sql += ` LIMIT $${limitIndex}`;
  sql += ` OFFSET $${offsetIndex}`;

  const result = await pool.query(sql, params);
  return result.rows;
};

export const updateExamRecordById = async ({
  id,
  year = null,
  totalScore = null,
  averageScore = null,
  percentile = null,
  resultStatus = null,
}) => {
  const result = await pool.query(
    `UPDATE exams
     SET year = COALESCE($2, year),
         total_score = COALESCE($3, total_score),
         average_score = COALESCE($4, average_score),
         percentile = COALESCE($5, percentile),
         result_status = COALESCE($6, result_status),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING id`,
    [id, year, totalScore, averageScore, percentile, resultStatus],
  );

  return result.rows[0] || null;
};

export const deleteExamRecordById = async (id, institutionId = null) => {
  let sql = `DELETE FROM exams WHERE id = $1`;
  const params = [id];

  // enforce institution scope if provided
  if (institutionId) {
    params.push(institutionId);
    sql += ` AND institution_id = $2`;
  }

  sql += ` RETURNING id`;

  const result = await pool.query(sql, params);
  return result.rows[0]; // undefined if not found / not allowed
};