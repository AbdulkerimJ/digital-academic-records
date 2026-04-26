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
    `INSERT INTO exam_records (
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
    `SELECT er.id,
            er.student_id AS "studentId",
            er.exam_type_id AS "examTypeId",
            et.code AS "examTypeCode",
            et.name AS "examTypeName",
            er.institution_id AS "institutionId",
            er.year,
            er.total_score AS "totalScore",
            er.average_score AS "averageScore",
            er.percentile,
            er.result_status AS "resultStatus",
            er.created_at AS "createdAt",
            er.updated_at AS "updatedAt"
     FROM exam_records er
     JOIN exam_types et ON er.exam_type_id = et.id
     WHERE er.id = $1
     LIMIT 1`,
    [id],
  );

  return result.rows[0] || null;
};

export const findExamRecords = async ({
  institutionId = null,
  examTypeCode = null,
} = {}) => {
  const conditions = [];
  const params = [];

  if (institutionId !== null) {
    params.push(institutionId);
    conditions.push(`er.institution_id = $${params.length}`);
  }

  if (examTypeCode !== null) {
    params.push(examTypeCode);
    conditions.push(`UPPER(TRIM(et.code)) = UPPER(TRIM($${params.length}))`);
  }

  let sql = `SELECT er.id,
            er.student_id AS "studentId",
            er.exam_type_id AS "examTypeId",
            et.code AS "examTypeCode",
            et.name AS "examTypeName",
            er.institution_id AS "institutionId",
            er.year,
            er.total_score AS "totalScore",
            er.average_score AS "averageScore",
            er.percentile,
            er.result_status AS "resultStatus",
            er.created_at AS "createdAt",
            er.updated_at AS "updatedAt"
     FROM exam_records er
     JOIN exam_types et ON er.exam_type_id = et.id`;

  if (conditions.length > 0) {
    sql += `\n     WHERE ${conditions.join(" AND ")}`;
  }

  sql += `\n     ORDER BY er.created_at DESC`;

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
    `UPDATE exam_records
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
