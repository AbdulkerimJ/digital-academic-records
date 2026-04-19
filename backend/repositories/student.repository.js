import pool from "../config/pool.js";

export const findStudentByNationalId = async (faydaId) => {
  const result = await pool.query(
    `SELECT id,
            national_id AS "nationalId",
            first_name AS "firstName",
            last_name AS "lastName",
            date_of_birth AS "dateOfBirth",
            created_at AS "createdAt"
     FROM student
     WHERE national_id = $1`,
    [faydaId],
  );

  return result.rows[0] || null;
};

export const createStudentFromCitizen = async (faydaId, citizen) => {
  const { firstName, fatherName: lastName, dateOfBirth } = citizen;

  const result = await pool.query(
    `INSERT INTO student (national_id, first_name, last_name, date_of_birth)
     VALUES ($1, $2, $3, $4)
     RETURNING id,
     national_id AS "nationalId",
     first_name AS "firstName",
     last_name AS "lastName",
     date_of_birth AS "dateOfBirth",
     created_at AS "createdAt"`,
    [faydaId, firstName, lastName, dateOfBirth],
  );

  return result.rows[0];
};
