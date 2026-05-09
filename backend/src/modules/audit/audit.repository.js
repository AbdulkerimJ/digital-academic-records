import pool from "../../common/config/pool.js";


export const createAuditLogRecord = async ({
  userId,
  institutionId,
  action,
  entityType,
  entityId,
  oldValues,
  newValues,
  ipAddress,
  userAgent,
}) => {
  const result = await pool.query(
    `INSERT INTO audit_logs (
      user_id, 
      institution_id, 
      action, 
      entity_type, 
      entity_id, 
      old_values, 
      new_values, 
      ip_address, 
      user_agent
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id, created_at AS "createdAt"`,
    [
      userId,
      institutionId,
      action,
      entityType,
      entityId,
      JSON.stringify(oldValues),
      JSON.stringify(newValues),
      ipAddress,
      userAgent,
    ],
  );

  return result.rows[0];
};


export const findAuditLogs = async ({
  institutionId = null,
  userId = null,
  entityType = null,
  action = null,
  limit = 20,
  offset = 0,
}) => {
  const params = [];
  let sql = `
    SELECT 
      al.id,
      al.user_id AS "userId",
      al.institution_id AS "institutionId",
      al.action,
      al.entity_type AS "entityType",
      al.entity_id AS "entityId",
      al.old_values AS "oldValues",
      al.new_values AS "newValues",
      al.ip_address AS "ipAddress",
      al.user_agent AS "userAgent",
      al.created_at AS "createdAt",
      u.first_name AS "userFirstName",
      u.last_name AS "userLastName",
      u.email AS "userEmail",
      inst.name AS "institutionName"
    FROM audit_logs al
    LEFT JOIN app_user u ON al.user_id = u.id
    LEFT JOIN institution inst ON al.institution_id = inst.id
    WHERE 1=1
  `;

  if (institutionId) {
    params.push(institutionId);
    sql += ` AND al.institution_id = $${params.length}`;
  }

  if (userId) {
    params.push(userId);
    sql += ` AND al.user_id = $${params.length}`;
  }

  if (entityType) {
    params.push(entityType);
    sql += ` AND al.entity_type = $${params.length}`;
  }

  if (action) {
    params.push(action);
    sql += ` AND al.action = $${params.length}`;
  }

  sql += ` ORDER BY al.created_at DESC`;

  params.push(limit);
  sql += ` LIMIT $${params.length}`;

  params.push(offset);
  sql += ` OFFSET $${params.length}`;

  const result = await pool.query(sql, params);

  // Get total count for pagination
  const countParams = [];
  let countSql = `SELECT COUNT(*) FROM audit_logs WHERE 1=1`;
  
  if (institutionId) {
    countParams.push(institutionId);
    countSql += ` AND institution_id = $${countParams.length}`;
  }
  // ... (could add more count filters if needed)

  const countRes = await pool.query(countSql, countParams);

  return {
    logs: result.rows,
    totalCount: parseInt(countRes.rows[0].count, 10),
  };
};
