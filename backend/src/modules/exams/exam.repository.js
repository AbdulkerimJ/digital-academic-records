import pool from "../../common/config/pool.js";

export const findExamLevelByCode = async (code) => {
  const result = await pool.query(
    `SELECT id, code, name, is_active AS "isActive", created_at AS "createdAt"
     FROM exam_levels
     WHERE UPPER(TRIM(code)) = UPPER(TRIM($1))
     LIMIT 1`,
    [code],
  );

  return result.rows[0] || null;
};

export const findExamLevelById = async (id) => {
  const result = await pool.query(
    `SELECT id, code, name, is_active AS "isActive", created_at AS "createdAt"
     FROM exam_levels
     WHERE id = $1
     LIMIT 1`,
    [id],
  );

  return result.rows[0] || null;
};

export const findExamLevels = async () => {
  const result = await pool.query(
    `SELECT id,
            code,
            name,
            is_active AS "isActive",
            created_at AS "createdAt"
     FROM exam_levels
     ORDER BY code ASC`,
  );

  return result.rows;
};

export const createExamLevelRecord = async ({ code, name, isActive }) => {
  const result = await pool.query(
    `INSERT INTO exam_levels (code, name, is_active)
     VALUES ($1, $2, $3)
     RETURNING id, code, name, is_active AS "isActive", created_at AS "createdAt"`,
    [code, name, isActive],
  );

  return result.rows[0];
};

export const updateExamLevelById = async ({
  id,
  code = null,
  name = null,
  isActive = null,
}) => {
  const result = await pool.query(
    `UPDATE exam_levels
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
  examLevelId,
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
      exam_level_id,
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
      examLevelId,
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

export const findExamRecordById = async (id, institutionId = null) => {
  const params = [id];

  let sql = `
    SELECT 
      e.id,
      e.student_id AS "studentId",
      s.first_name AS "studentFirstName",
      s.last_name AS "studentLastName",
      s.national_id AS "studentNationalId",
      e.exam_level_id AS "examLevelId",
      et.code AS "examLevelCode",
      et.name AS "examLevelName",
      e.institution_id AS "institutionId",
      i.name AS "institutionName",
      e.year,
      e.total_score AS "totalScore",
      e.average_score AS "averageScore",
      e.percentile,
      e.result_status AS "resultStatus",
      e.created_at AS "createdAt",
      e.updated_at AS "updatedAt"
    FROM exams e
    JOIN exam_levels et ON e.exam_level_id = et.id
    JOIN student s ON e.student_id = s.id
    JOIN institution i ON e.institution_id = i.id
    WHERE e.id = $1 AND e.is_deleted = false
  `;

  if (institutionId) {
    params.push(institutionId);
    sql += ` AND e.institution_id = $${params.length}`;
  }

  const result = await pool.query(sql, params);

  return result.rows[0] || null;
};

export const findExamRecords = async (query = {}, pagination = {}) => {
  let sql = `
    SELECT 
      e.id,
      e.student_id AS "studentId",
      s.first_name AS "studentFirstName",
      s.last_name AS "studentLastName",
      s.national_id AS "studentNationalId",
      e.exam_level_id AS "examLevelId",
      et.code AS "examLevelCode",
      et.name AS "examLevelName",
      e.institution_id AS "institutionId",
      i.name AS "institutionName",
      e.year,
      e.total_score AS "totalScore",
      e.average_score AS "averageScore",
      e.percentile,
      e.result_status AS "resultStatus",
      e.created_at AS "createdAt",
      e.updated_at AS "updatedAt"
    FROM exams e
    JOIN exam_levels et ON e.exam_level_id = et.id
    JOIN student s ON e.student_id = s.id
    JOIN institution i ON e.institution_id = i.id
    WHERE e.is_deleted = false
  `;

  const conditions = [];
  const params = [];

  const { institutionId, examLevelCode, search, year, studentId } = query;
  const { page = 1, limit = 10 } = pagination;

  const offset = (page - 1) * limit;

  if (institutionId) {
    params.push(institutionId);
    conditions.push(`e.institution_id = $${params.length}`);
  }

  if (studentId) {
    params.push(studentId);
    conditions.push(`e.student_id = $${params.length}`);
  }

  if (examLevelCode) {
    params.push(examLevelCode);
    conditions.push(`et.code = $${params.length}`);
  }

  if (year) {
    params.push(year);
    conditions.push(`e.year = $${params.length}`);
  }

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(s.national_id ILIKE $${params.length} OR s.first_name ILIKE $${params.length} OR s.last_name ILIKE $${params.length})`);
  }

  if (conditions.length > 0) {
    sql += ` AND ` + conditions.join(" AND ");
  }

  // 1. Get Total Count
  const countSql = `
    SELECT COUNT(*) 
    FROM exams e
    JOIN exam_levels et ON e.exam_level_id = et.id
    JOIN student s ON e.student_id = s.id
    WHERE e.is_deleted = false ${conditions.length > 0 ? " AND " + conditions.join(" AND ") : ""}
  `;
  const countRes = await pool.query(countSql, params.slice(0, conditions.length));
  const totalCount = parseInt(countRes.rows[0].count, 10);

  // 2. Get Paginated Data
  sql += ` ORDER BY e.created_at DESC`;

  // pagination
  params.push(limit);
  const limitIndex = params.length;

  params.push(offset);
  const offsetIndex = params.length;

  sql += ` LIMIT $${limitIndex}`;
  sql += ` OFFSET $${offsetIndex}`;

  const result = await pool.query(sql, params);
  
  return {
    examRecords: result.rows,
    count: totalCount
  };
};

export const updateExamRecordById = async ({
  id,
  institutionId = null,
  year,
  totalScore,
  averageScore,
  percentile,
  resultStatus,
}) => {
  const updates = [];
  const params = [];

  // always first param = id
  params.push(id);

  // dynamic fields
  if (year !== undefined) {
    params.push(year);
    updates.push(`year = $${params.length}`);
  }

  if (totalScore !== undefined) {
    params.push(totalScore);
    updates.push(`total_score = $${params.length}`);
  }

  if (averageScore !== undefined) {
    params.push(averageScore);
    updates.push(`average_score = $${params.length}`);
  }

  if (percentile !== undefined) {
    params.push(percentile);
    updates.push(`percentile = $${params.length}`);
  }

  if (resultStatus !== undefined) {
    params.push(resultStatus);
    updates.push(`result_status = $${params.length}`);
  }

  // always update timestamp
  updates.push(`updated_at = CURRENT_TIMESTAMP`);

  let sql = `
    UPDATE exams
    SET ${updates.join(", ")}
    WHERE id = $1
  `;

  // institution scoping
  if (institutionId) {
    params.push(institutionId);
    sql += ` AND institution_id = $${params.length}`;
  }

  sql += ` RETURNING id`;

  const result = await pool.query(sql, params);

  return result.rows[0] || null;
};

export const deleteExamRecordById = async (id, institutionId = null) => {
  let sql = `DELETE FROM exams WHERE id = $1`;
  const params = [id];

  // enforce institution scope if provided
  if (institutionId) {
    params.push(institutionId);
    sql += ` AND institution_id = $${params.length}`;
  }

  sql += ` RETURNING id`;

  const result = await pool.query(sql, params);
  return result.rows[0]; 
};
