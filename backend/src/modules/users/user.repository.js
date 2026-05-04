import pool from "../../common/config/pool.js";

export const findRoles = async () => {
  const result = await pool.query(
    `SELECT id,
            role_name AS "roleName"
     FROM roles
     ORDER BY id ASC`,
  );

  return result.rows;
};

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
    `SELECT app_user.id,
            app_user.first_name AS "firstName",
            app_user.last_name AS "lastName",
            app_user.email,
            app_user.password_hash AS "passwordHash",
            app_user.is_active AS "isActive",
            app_user.is_suspended AS "isSuspended",
            app_user.suspended_at AS "suspendedAt",
            app_user.suspended_by AS "suspendedBy",
            app_user.suspension_reason AS "suspensionReason",
            app_user.invitation_token AS "invitationToken",
            app_user.invitation_expires AS "invitationExpires",
            app_user.reset_token AS "resetToken",
            app_user.reset_expires AS "resetExpires",
            app_user.token_version AS "tokenVersion",
            app_user.role_id AS "roleId",
            app_user.institution_id AS "institutionId",
            institution.name AS "institutionName",
            institution.code AS "institutionCode",
            institution.type AS "institutionType",
            app_user.password_changed_at AS "passwordChangedAt",
            app_user.created_at AS "createdAt",
            app_user.updated_at AS "updatedAt"
     FROM app_user
     LEFT JOIN institution ON institution.id = app_user.institution_id
     WHERE app_user.email = $1`,
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
            app_user.is_active AS "isActive",
            app_user.is_suspended AS "isSuspended",
            app_user.suspended_at AS "suspendedAt",
            app_user.suspended_by AS "suspendedBy",
            app_user.suspension_reason AS "suspensionReason",
            app_user.invitation_token AS "invitationToken",
            app_user.invitation_expires AS "invitationExpires",
            app_user.reset_token AS "resetToken",
            app_user.reset_expires AS "resetExpires",
            app_user.token_version AS "tokenVersion",
            app_user.role_id AS "roleId",
            app_user.institution_id AS "institutionId",
                 institution.name AS "institutionName",
                 institution.code AS "institutionCode",
                 institution.type AS "institutionType",
            app_user.created_at AS "createdAt",
            app_user.updated_at AS "updatedAt",
            app_user.password_changed_at AS "passwordChangedAt",
            roles.role_name AS "roleName"
     FROM app_user
     INNER JOIN roles ON roles.id = app_user.role_id
               LEFT JOIN institution ON institution.id = app_user.institution_id
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
            app_user.is_active AS "isActive",
            app_user.is_suspended AS "isSuspended",
            app_user.suspended_at AS "suspendedAt",
            app_user.suspended_by AS "suspendedBy",
            app_user.suspension_reason AS "suspensionReason",
            app_user.invitation_token AS "invitationToken",
            app_user.invitation_expires AS "invitationExpires",
            app_user.reset_token AS "resetToken",
            app_user.reset_expires AS "resetExpires",
            app_user.token_version AS "tokenVersion",
            app_user.role_id AS "roleId",
            app_user.institution_id AS "institutionId",
              institution.name AS "institutionName",
              institution.code AS "institutionCode",
              institution.type AS "institutionType",
            app_user.created_at AS "createdAt",
            app_user.updated_at AS "updatedAt",
            app_user.password_changed_at AS "passwordChangedAt",
                 roles.role_name AS "roleName",
                 suspender.id AS "suspenderId",
                 suspender.first_name AS "suspenderFirstName",
                 suspender.last_name AS "suspenderLastName",
                 suspender.email AS "suspenderEmail"
     FROM app_user
     INNER JOIN roles ON roles.id = app_user.role_id
               LEFT JOIN institution ON institution.id = app_user.institution_id
               LEFT JOIN app_user AS suspender ON suspender.id = app_user.suspended_by
     WHERE app_user.id = $1`,
    [id],
  );

  return result.rows[0] || null;
};

export const findUsersWithRole = async ({ 
  excludeUserId, 
  limit = 10, 
  offset = 0, 
  sortBy = 'createdAt', 
  sortDir = 'DESC',
  search = '',
  role = 'all',
  status = 'all',
  institutionId = 'all'
} = {}) => {
  const params = [];
  let query = `
    SELECT app_user.id,
           app_user.first_name AS "firstName",
           app_user.last_name AS "lastName",
           app_user.email,
           app_user.is_active AS "isActive",
           app_user.is_suspended AS "isSuspended",
           app_user.suspended_at AS "suspendedAt",
           app_user.suspension_reason AS "suspensionReason",
           app_user.invitation_token AS "invitationToken",
           app_user.invitation_expires AS "invitationExpires",
           app_user.role_id AS "roleId",
           app_user.institution_id AS "institutionId",
           institution.name AS "institutionName",
           roles.role_name AS "roleName",
           app_user.created_at AS "createdAt",
           COUNT(*) OVER() AS "totalCount"
    FROM app_user
    INNER JOIN roles ON roles.id = app_user.role_id
    LEFT JOIN institution ON institution.id = app_user.institution_id
    WHERE 1=1
  `;

  if (excludeUserId) {
    params.push(excludeUserId);
    query += ` AND app_user.id != $${params.length}`;
  }

  if (search && search.trim()) {
    params.push(`%${search.trim().toLowerCase()}%`);
    query += ` AND (LOWER(app_user.first_name) LIKE $${params.length} 
                OR LOWER(app_user.last_name) LIKE $${params.length} 
                OR LOWER(app_user.email) LIKE $${params.length})`;
  }

  if (role !== 'all') {
    params.push(role);
    query += ` AND roles.role_name = $${params.length}`;
  }

  if (institutionId !== 'all') {
    params.push(institutionId);
    query += ` AND app_user.institution_id = $${params.length}`;
  }

  if (status !== 'all') {
    if (status === 'ACTIVE') {
      query += ` AND app_user.is_active = TRUE AND app_user.is_suspended = FALSE`;
    } else if (status === 'SUSPENDED') {
      query += ` AND app_user.is_suspended = TRUE`;
    } else if (status === 'PENDING') {
      query += ` AND app_user.invitation_token IS NOT NULL AND app_user.is_active = FALSE`;
    } else if (status === 'REVOKED') {
      query += ` AND app_user.invitation_token IS NULL AND app_user.is_active = FALSE AND app_user.is_suspended = FALSE`;
    }
  }

  // Sorting
  const allowedSortFields = ['firstName', 'lastName', 'email', 'roleName', 'institutionName', 'createdAt'];
  const actualSortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const actualSortDir = ['ASC', 'DESC'].includes(sortDir.toUpperCase()) ? sortDir.toUpperCase() : 'DESC';
  
  const sortColumnMap = {
    firstName: 'app_user.first_name',
    lastName: 'app_user.last_name',
    email: 'app_user.email',
    roleName: 'roles.role_name',
    institutionName: 'institution.name',
    createdAt: 'app_user.created_at'
  };

  const sortColumn = sortColumnMap[actualSortField] || 'app_user.created_at';
  query += ` ORDER BY ${sortColumn} ${actualSortDir}`;

  // Pagination
  params.push(limit);
  query += ` LIMIT $${params.length}`;
  params.push(offset);
  query += ` OFFSET $${params.length}`;

  const result = await pool.query(query, params);
  return result.rows;
};

export const createUserRecord = async ({
  firstName,
  lastName,
  email,
  roleId,
  institutionId,
  invitationToken,
  invitationExpires,
}) => {
  const result = await pool.query(
    `INSERT INTO app_user (first_name, last_name, email, password_hash, is_active, invitation_token, invitation_expires, role_id, institution_id)
     VALUES ($1, $2, $3, NULL, FALSE, $4, $5, $6, $7)
      RETURNING id,
          first_name AS "firstName",
          last_name AS "lastName",
          email,
          is_active AS "isActive",
          invitation_expires AS "invitationExpires",
          role_id AS "roleId",
          institution_id AS "institutionId",
          (SELECT name FROM institution WHERE institution.id = app_user.institution_id) AS "institutionName",
          (SELECT code FROM institution WHERE institution.id = app_user.institution_id) AS "institutionCode",
          (SELECT type FROM institution WHERE institution.id = app_user.institution_id) AS "institutionType",
          created_at AS "createdAt",
          updated_at AS "updatedAt"`,
    [
      firstName,
      lastName,
      email,
      invitationToken,
      invitationExpires,
      roleId,
      institutionId,
    ],
  );

  return result.rows[0];
};

export const findUserByInvitationToken = async (invitationToken) => {
  const result = await pool.query(
    `SELECT app_user.id,
            app_user.first_name AS "firstName",
            app_user.last_name AS "lastName",
            app_user.email,
            app_user.password_hash AS "passwordHash",
            app_user.is_active AS "isActive",
            app_user.invitation_token AS "invitationToken",
            app_user.invitation_expires AS "invitationExpires",
            app_user.role_id AS "roleId",
            app_user.institution_id AS "institutionId",
            institution.name AS "institutionName",
            institution.code AS "institutionCode",
            institution.type AS "institutionType",
            app_user.created_at AS "createdAt",
            app_user.updated_at AS "updatedAt"
     FROM app_user
     LEFT JOIN institution ON institution.id = app_user.institution_id
     WHERE app_user.invitation_token = $1`,
    [invitationToken],
  );

  return result.rows[0] || null;
};

export const activateUserByInvitationToken = async ({
  invitationToken,
  passwordHash,
}) => {
  const result = await pool.query(
    `UPDATE app_user
     SET password_hash = $2,
         is_active = TRUE,
         invitation_token = NULL,
         invitation_expires = NULL,
         password_changed_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
     WHERE invitation_token = $1
     RETURNING id,
               first_name AS "firstName",
               last_name AS "lastName",
               email,
               is_active AS "isActive",
               role_id AS "roleId",
               institution_id AS "institutionId",
               (SELECT name FROM institution WHERE institution.id = app_user.institution_id) AS "institutionName",
               (SELECT code FROM institution WHERE institution.id = app_user.institution_id) AS "institutionCode",
               (SELECT type FROM institution WHERE institution.id = app_user.institution_id) AS "institutionType",
               updated_at AS "updatedAt"`,
    [invitationToken, passwordHash],
  );

  return result.rows[0] || null;
};

export const revokeInvitationByUserId = async (id) => {
  const result = await pool.query(
    `UPDATE app_user
     SET invitation_token = NULL,
         invitation_expires = NULL,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING id,
               first_name AS "firstName",
               last_name AS "lastName",
               email,
               is_active AS "isActive",
               invitation_expires AS "invitationExpires",
               institution_id AS "institutionId",
               (SELECT name FROM institution WHERE institution.id = app_user.institution_id) AS "institutionName",
               (SELECT code FROM institution WHERE institution.id = app_user.institution_id) AS "institutionCode",
               (SELECT type FROM institution WHERE institution.id = app_user.institution_id) AS "institutionType",
               updated_at AS "updatedAt"`,
    [id],
  );

  return result.rows[0] || null;
};

export const replaceInvitationByUserId = async ({
  id,
  invitationToken,
  invitationExpires,
}) => {
  const result = await pool.query(
    `UPDATE app_user
     SET invitation_token = $2,
         invitation_expires = $3,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING id,
               first_name AS "firstName",
               last_name AS "lastName",
               email,
               is_active AS "isActive",
               invitation_expires AS "invitationExpires",
               updated_at AS "updatedAt"`,
    [id, invitationToken, invitationExpires],
  );

  return result.rows[0] || null;
};

export const updateUserById = async ({
  id,
  firstName = null,
  lastName = null,
  email = null,
  passwordHash = null,
  roleId = null,
  institutionId = null,
  invitationToken = undefined,
  invitationExpires = undefined,
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
         invitation_token = CASE WHEN $9 = 1 THEN $8 ELSE invitation_token END,
         invitation_expires = CASE WHEN $11 = 1 THEN $10 ELSE invitation_expires END,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING id,
               first_name AS "firstName",
               last_name AS "lastName",
               email,
               is_active AS "isActive",
               role_id AS "roleId",
               institution_id AS "institutionId",
               invitation_token AS "invitationToken",
               invitation_expires AS "invitationExpires",
               created_at AS "createdAt",
               updated_at AS "updatedAt"`,
    [
      id,
      firstName,
      lastName,
      email,
      passwordHash,
      roleId,
      institutionId,
      invitationToken === undefined ? null : invitationToken,
      invitationToken === undefined ? 0 : 1,
      invitationExpires === undefined ? null : invitationExpires,
      invitationExpires === undefined ? 0 : 1,
    ],
  );

  return result.rows[0] || null;
};

export const deleteUserById = async (id) => {
  const result = await pool.query(
    `DELETE FROM app_user
     WHERE id = $1
     RETURNING id,
               first_name AS "firstName",
               last_name AS "lastName",
               email`,
    [id],
  );

  return result.rows[0] || null;
};

export const incrementUserTokenVersionById = async (id) => {
  const result = await pool.query(
    `UPDATE app_user
     SET token_version = token_version + 1,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING id,
               token_version AS "tokenVersion"`,
    [id],
  );

  return result.rows[0] || null;
};

export const suspendUserById = async ({
  id,
  suspendedBy,
  suspensionReason,
}) => {
  const result = await pool.query(
    `UPDATE app_user
     SET is_suspended = TRUE,
         suspended_at = CURRENT_TIMESTAMP,
         suspended_by = $2,
         suspension_reason = $3,
         token_version = token_version + 1,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING id,
               first_name AS "firstName",
               last_name AS "lastName",
               email,
               is_active AS "isActive",
               is_suspended AS "isSuspended",
               suspended_at AS "suspendedAt",
               suspended_by AS "suspendedBy",
               suspension_reason AS "suspensionReason",
               token_version AS "tokenVersion",
               updated_at AS "updatedAt"`,
    [id, suspendedBy, suspensionReason || null],
  );

  return result.rows[0] || null;
};

export const unsuspendUserById = async ({ id }) => {
  const result = await pool.query(
    `UPDATE app_user
     SET is_suspended = FALSE,
         suspended_at = NULL,
         suspended_by = NULL,
         suspension_reason = NULL,
         token_version = token_version + 1,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING id,
               first_name AS "firstName",
               last_name AS "lastName",
               email,
               is_active AS "isActive",
               is_suspended AS "isSuspended",
               suspended_at AS "suspendedAt",
               suspended_by AS "suspendedBy",
               suspension_reason AS "suspensionReason",
               token_version AS "tokenVersion",
               updated_at AS "updatedAt"`,
    [id],
  );

  return result.rows[0] || null;
};
