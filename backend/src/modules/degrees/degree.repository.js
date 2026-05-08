import pool from "../../common/config/pool.js";

export const createDegreeRecord = async ({
  studentId,
  institutionId,
  degreeLevelId,
  degreeTitleId,
  collegeId,
  departmentId,
  cgpa = null,
  graduationDate,
}) => {
  const result = await pool.query(
    `INSERT INTO degrees (
      student_id,
      institution_id,
      degree_level_id,
      degree_title_id,
      college_id,
      department_id,
      cgpa,
      graduation_date
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id`,
    [
      studentId,
      institutionId,
      degreeLevelId,
      degreeTitleId,
      collegeId,
      departmentId,
      cgpa,
      graduationDate,
    ],
  );

  return result.rows[0];
};

export const findDegreeById = async (id, institutionId = null) => {
  const params = [id];

  let sql = `
    SELECT 
      d.id,
      d.student_id AS "studentId",
      d.institution_id AS "institutionId",
      i.name AS "institutionName",
      d.degree_level_id AS "degreeLevelId",
      dl.code AS "degreeLevelCode",
      dl.name AS "degreeLevelName",
      d.degree_title_id AS "degreeTitleId",
      dt.code AS "degreeTitleCode",
      dt.title AS "degreeTitle",
      d.college_id AS "collegeId",
      c.name AS "collegeName",
      d.department_id AS "departmentId",
      dep.name AS "departmentName",
      d.cgpa,
      d.graduation_date AS "graduationDate",
      s.first_name AS "studentFirstName",
      s.last_name AS "studentLastName",
      s.national_id AS "studentNationalId",
      d.created_at AS "createdAt",
      d.updated_at AS "updatedAt"
    FROM degrees d
    JOIN degree_levels dl ON d.degree_level_id = dl.id
    JOIN degree_titles dt ON d.degree_title_id = dt.id
    JOIN colleges c ON d.college_id = c.id
    JOIN departments dep ON d.department_id = dep.id
    JOIN institution i ON d.institution_id = i.id
    JOIN student s ON d.student_id = s.id
    WHERE d.id = $1
  `;

  if (institutionId) {
    params.push(institutionId);
    sql += ` AND d.institution_id = $${params.length}`;
  }

  const result = await pool.query(sql, params);

  return result.rows[0] || null;
};

export const findDegrees = async (query = {}, pagination = {}) => {
  let sql = `
    SELECT 
      d.id,
      d.student_id AS "studentId",
      d.institution_id AS "institutionId",
      i.name AS "institutionName",
      d.degree_level_id AS "degreeLevelId",
      dl.code AS "degreeLevelCode",
      dl.name AS "degreeLevelName",
      d.degree_title_id AS "degreeTitleId",
      dt.code AS "degreeTitleCode",
      dt.title AS "degreeTitle",
      d.college_id AS "collegeId",
      c.name AS "collegeName",
      d.department_id AS "departmentId",
      dep.name AS "departmentName",
      d.cgpa,
      d.graduation_date AS "graduationDate",
      s.first_name AS "studentFirstName",
      s.last_name AS "studentLastName",
      s.national_id AS "studentNationalId",
      d.created_at AS "createdAt",
      d.updated_at AS "updatedAt"
    FROM degrees d
    JOIN degree_levels dl ON d.degree_level_id = dl.id
    JOIN degree_titles dt ON d.degree_title_id = dt.id
    JOIN colleges c ON d.college_id = c.id
    JOIN departments dep ON d.department_id = dep.id
    JOIN institution i ON d.institution_id = i.id
    JOIN student s ON d.student_id = s.id
  `;

  const conditions = [];
  const params = [];
  const { institutionId, degreeLevelCode, search, graduationYear, studentId } = query;
  const { page = 1, limit = 10 } = pagination;

  const offset = (page - 1) * limit;

  if (institutionId) {
    params.push(institutionId);
    conditions.push(`d.institution_id = $${params.length}`);
  }

  if (studentId) {
    params.push(studentId);
    conditions.push(`d.student_id = $${params.length}`);
  }

  if (degreeLevelCode) {
    params.push(degreeLevelCode);
    conditions.push(`dl.code = $${params.length}`);
  }

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(s.national_id ILIKE $${params.length} OR s.first_name ILIKE $${params.length} OR s.last_name ILIKE $${params.length})`);
  }

  if (graduationYear) {
    params.push(graduationYear);
    conditions.push(`EXTRACT(YEAR FROM d.graduation_date) = $${params.length}`);
  }

  if (conditions.length > 0) {
    sql += ` WHERE ` + conditions.join(" AND ");
  }

  // 1. Get Total Count
  const countSql = `
    SELECT COUNT(*) 
    FROM degrees d
    JOIN degree_levels dl ON d.degree_level_id = dl.id
    JOIN student s ON d.student_id = s.id
    ${conditions.length > 0 ? " WHERE " + conditions.join(" AND ") : ""}
  `;
  const countRes = await pool.query(countSql, params.slice(0, conditions.length));
  const totalCount = parseInt(countRes.rows[0].count, 10);

  // 2. Get Paginated Data
  sql += ` ORDER BY d.created_at DESC`;

  // pagination
  params.push(limit);
  const limitIndex = params.length;

  params.push(offset);
  const offsetIndex = params.length;

  sql += ` LIMIT $${limitIndex}`;
  sql += ` OFFSET $${offsetIndex}`;

  const result = await pool.query(sql, params);
  
  return {
    degrees: result.rows,
    count: totalCount
  };
};

export const updateDegreeById = async ({
  id,
  institutionId = null,
  degreeLevelId,
  degreeTitleId,
  collegeId,
  departmentId,
  cgpa,
  graduationDate,
}) => {
  const updates = [];
  const params = [];

  // always first param = id
  params.push(id);

  // dynamic fields
  if (degreeLevelId !== undefined) {
    params.push(degreeLevelId);
    updates.push(`degree_level_id = $${params.length}`);
  }

  if (degreeTitleId !== undefined) {
    params.push(degreeTitleId);
    updates.push(`degree_title_id = $${params.length}`);
  }

  if (collegeId !== undefined) {
    params.push(collegeId);
    updates.push(`college_id = $${params.length}`);
  }

  if (departmentId !== undefined) {
    params.push(departmentId);
    updates.push(`department_id = $${params.length}`);
  }

  if (cgpa !== undefined) {
    params.push(cgpa);
    updates.push(`cgpa = $${params.length}`);
  }

  if (graduationDate !== undefined) {
    params.push(graduationDate);
    updates.push(`graduation_date = $${params.length}`);
  }

  // always update timestamp
  updates.push(`updated_at = CURRENT_TIMESTAMP`);

  let sql = `
    UPDATE degrees
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

export const deleteDegreeById = async (id, institutionId = null) => {
  let sql = `DELETE FROM degrees WHERE id = $1`;
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
