import pool from "../../common/config/pool.js";

export const findStudentById = async (id) => {
  const result = await pool.query(
    `SELECT id,
            national_id AS "nationalId",
            first_name AS "firstName",
            last_name AS "lastName",
            gender,
            date_of_birth AS "dateOfBirth",
            token_version AS "tokenVersion",
            created_at AS "createdAt"
     FROM student
     WHERE id = $1
     LIMIT 1`,
    [id],
  );

  return result.rows[0] || null;
};

export const findStudentByNationalId = async (faydaId) => {
  const result = await pool.query(
    `SELECT id,
            national_id AS "nationalId",
            first_name AS "firstName",
            last_name AS "lastName",
            gender,
            date_of_birth AS "dateOfBirth",
            token_version AS "tokenVersion",
            created_at AS "createdAt"
     FROM student
     WHERE national_id = $1`,
    [faydaId],
  );

  return result.rows[0] || null;
};

export const createStudentFromCitizen = async (faydaId, citizen) => {
  const { firstName, fatherName: lastName, gender, dateOfBirth } = citizen;

  const result = await pool.query(
    `INSERT INTO student (national_id, first_name, last_name, gender, date_of_birth)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id,
     national_id AS "nationalId",
     first_name AS "firstName",
     last_name AS "lastName",
     gender,
     date_of_birth AS "dateOfBirth",
     token_version AS "tokenVersion",
     created_at AS "createdAt"`,
    [faydaId, firstName, lastName, gender, dateOfBirth],
  );

  return result.rows[0];
};

export const incrementStudentTokenVersionById = async (id) => {
  const result = await pool.query(
    `UPDATE student
     SET token_version = token_version + 1
     WHERE id = $1
     RETURNING id,
               token_version AS "tokenVersion"`,
    [id],
  );

  return result.rows[0] || null;
};

export const findStudents = async ({
  search,
  startDate,
  endDate,
  page = 1,
  limit = 10,
} = {}) => {
  const offset = (page - 1) * limit;

  let sql = `
    SELECT id,
           national_id AS "nationalId",
           first_name AS "firstName",
           last_name AS "lastName",
           gender,
           date_of_birth AS "dateOfBirth",
           created_at AS "createdAt"
    FROM student
  `;

  const conditions = [];
  const params = [];

  if (search) {
    const terms = search.trim().split(/\s+/);

    if (terms.length === 1) {
      params.push(`%${terms[0]}%`);
      const i = params.length;
      conditions.push(`(first_name ILIKE $${i} OR last_name ILIKE $${i} OR national_id ILIKE $${i})`);
    } else {
      const first = `%${terms[0]}%`;
      const last = `%${terms[1]}%`;
      params.push(first);
      const i1 = params.length;
      params.push(last);
      const i2 = params.length;
      conditions.push(`((first_name ILIKE $${i1} AND last_name ILIKE $${i2}) OR (first_name ILIKE $${i2} AND last_name ILIKE $${i1}))`);
    }
  }

  if (startDate) {
    params.push(startDate);
    conditions.push(`created_at >= $${params.length}`);
  }

  if (endDate) {
    params.push(endDate);
    conditions.push(`created_at <= $${params.length}`);
  }

  if (conditions.length > 0) {
    sql += ` WHERE ` + conditions.join(" AND ");
  }

  // 1. Get Total Count
  const countSql = `SELECT COUNT(*) FROM student ${conditions.length > 0 ? " WHERE " + conditions.join(" AND ") : ""}`;
  const countRes = await pool.query(countSql, params);
  const totalCount = parseInt(countRes.rows[0].count, 10);

  // 2. Get Paginated Data
  sql += ` ORDER BY created_at DESC`;
  params.push(limit);
  sql += ` LIMIT $${params.length}`;
  params.push(offset);
  sql += ` OFFSET $${params.length}`;

  const result = await pool.query(sql, params);
  
  return {
    students: result.rows,
    totalCount
  };
};




