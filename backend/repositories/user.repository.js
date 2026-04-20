import pool from "../config/pool.js";

export const getRoleById = async (roleId) => {
  const result = await pool.query(
    `SELECT 1
     FROM roles
     WHERE id = $1
     LIMIT 1`,
    [roleId],
  );

  return result.rowCount > 0;
};

export const findUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT id,
            first_name AS "firstName",
            last_name AS "lastName",
            email,
            password_hash AS "passwordHash",
            role_id AS "roleId",
            institution_id AS "institutionId",
            email_otp AS "emailOtp",
            email_otp_expires AS "emailOtpExpires",
            is_verified AS "isVerified",
              password_changed_at AS "passwordChangedAt",
            created_at AS "createdAt",
            updated_at AS "updatedAt"
     FROM app_user
     WHERE email = $1`,
    [email],
  );

  return result.rows[0] || null;
};

export const findUserByEmailWithRole = async (email) => {
  const result = await pool.query(
    `SELECT app_user.id,
            app_user.first_name AS "firstName",
            app_user.last_name AS "lastName",
            app_user.email,
            app_user.password_hash AS "passwordHash",
            app_user.role_id AS "roleId",
            app_user.institution_id AS "institutionId",
            app_user.email_otp AS "emailOtp",
            app_user.email_otp_expires AS "emailOtpExpires",
            app_user.is_verified AS "isVerified",
            app_user.created_at AS "createdAt",
            app_user.updated_at AS "updatedAt",
             app_user.password_changed_at AS "passwordChangedAt",
            roles.role_name AS "roleName"
     FROM app_user
     INNER JOIN roles ON roles.id = app_user.role_id
     WHERE app_user.email = $1`,
    [email],
  );

  return result.rows[0] || null;
};

export const findUserByIdWithRole = async (id) => {
  const result = await pool.query(
    `SELECT app_user.id,
            app_user.first_name AS "firstName",
            app_user.last_name AS "lastName",
            app_user.email,
            app_user.password_hash AS "passwordHash",
            app_user.role_id AS "roleId",
            app_user.institution_id AS "institutionId",
            app_user.email_otp AS "emailOtp",
            app_user.email_otp_expires AS "emailOtpExpires",
            app_user.is_verified AS "isVerified",
            app_user.created_at AS "createdAt",
            app_user.updated_at AS "updatedAt",
             app_user.password_changed_at AS "passwordChangedAt",
            roles.role_name AS "roleName"
     FROM app_user
     INNER JOIN roles ON roles.id = app_user.role_id
     WHERE app_user.id = $1`,
    [id],
  );

  return result.rows[0] || null;
};

export const createUserRecord = async ({
  firstName,
  lastName,
  email,
  passwordHash,
  roleId,
  institutionId,
  emailOtp,
  emailOtpExpires,
}) => {
  const result = await pool.query(
    `INSERT INTO app_user (first_name, last_name, email, password_hash, role_id, institution_id, email_otp, email_otp_expires, is_verified)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, FALSE)
      RETURNING id,
          first_name AS "firstName",
          last_name AS "lastName",
          email,
          role_id AS "roleId",
          institution_id AS "institutionId",
          is_verified AS "isVerified",
          created_at AS "createdAt",
          updated_at AS "updatedAt"`,
    [
      firstName,
      lastName,
      email,
      passwordHash,
      roleId,
      institutionId,
      emailOtp,
      emailOtpExpires,
    ],
  );

  return result.rows[0];
};

export const updateUserById = async ({
  id,
  firstName = null,
  lastName = null,
  email = null,
  passwordHash = null,
  roleId = null,
  institutionId = null,
}) => {
  const result = await pool.query(
    `UPDATE app_user
     SET first_name = COALESCE($2, first_name),
         last_name = COALESCE($3, last_name),
         email = COALESCE($4, email),
         password_hash = COALESCE($5, password_hash),
         password_changed_at = CASE
           WHEN $5 IS NOT NULL THEN CURRENT_TIMESTAMP
           ELSE password_changed_at
         END,
         role_id = COALESCE($6, role_id),
         institution_id = COALESCE($7, institution_id),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING id,
               first_name AS "firstName",
               last_name AS "lastName",
               email,
               role_id AS "roleId",
               institution_id AS "institutionId",
               created_at AS "createdAt",
               updated_at AS "updatedAt"`,
    [id, firstName, lastName, email, passwordHash, roleId, institutionId],
  );

  return result.rows[0] || null;
};

export const verifyUserEmailById = async (id) => {
  const result = await pool.query(
    `UPDATE app_user
     SET is_verified = TRUE,
         email_otp = NULL,
         email_otp_expires = NULL,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING id,
               first_name AS "firstName",
               last_name AS "lastName",
               email,
               role_id AS "roleId",
               institution_id AS "institutionId",
               is_verified AS "isVerified",
               updated_at AS "updatedAt"`,
    [id],
  );

  return result.rows[0] || null;
};
