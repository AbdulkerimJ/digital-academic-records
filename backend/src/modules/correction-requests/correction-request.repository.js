import pool from "../../common/config/pool.js";

export const createCorrectionRequestRecord = async ({ studentId, institutionId, requestText, recordId, recordType }) => {
  const result = await pool.query(
    `INSERT INTO correction_request (student_id, institution_id, request_text, record_id, record_type)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, student_id AS "studentId", institution_id AS "institutionId", 
               request_text AS "requestText", status, 
               record_id AS "recordId", record_type AS "recordType",
               created_at AS "createdAt"`,
    [studentId, institutionId, requestText, recordId, recordType],
  );
  return result.rows[0];
};


export const findCorrectionRequestsByStudentId = async (studentId) => {
  const result = await pool.query(
    `SELECT id, student_id AS "studentId", institution_id AS "institutionId", 
            request_text AS "requestText", status, 
            record_id AS "recordId", record_type AS "recordType",
            reviewed_at AS "reviewedAt", rejection_reason AS "rejectionReason", 
            created_at AS "createdAt"
     FROM correction_request
     WHERE student_id = $1
     ORDER BY created_at DESC`,
    [studentId],
  );
  return result.rows;
};


export const findCorrectionRequests = async ({
  status,
  studentId,
  institutionId,
  startDate,
  endDate,
}) => {
  let query = `
    SELECT cr.id, cr.student_id AS "studentId", cr.institution_id AS "institutionId", 
           cr.request_text AS "requestText", cr.status, 
           cr.record_id AS "recordId", cr.record_type AS "recordType",
           cr.reviewed_at AS "reviewedAt", cr.rejection_reason AS "rejectionReason", 
           cr.created_at AS "createdAt",
           s.first_name AS "studentFirstName", s.last_name AS "studentLastName"
    FROM correction_request cr
    JOIN student s ON cr.student_id = s.id
  `;


  const conditions = [];
  const params = [];

  if (status !== undefined) {
    params.push(status);
    conditions.push(`cr.status = $${params.length}`);
  }

  if (studentId !== undefined) {
    params.push(studentId);
    conditions.push(`cr.student_id = $${params.length}`);
  }

  if (institutionId !== undefined) {
    params.push(institutionId);
    conditions.push(`cr.institution_id = $${params.length}`);
  }

  if (startDate) {
    params.push(startDate);
    conditions.push(`cr.created_at >= $${params.length}`);
  }

  if (endDate) {
    params.push(endDate);
    conditions.push(`cr.created_at <= $${params.length}`);
  }

  // Add WHERE only if conditions exist
  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(" AND ");
  }

  query += ` ORDER BY cr.created_at DESC`;

  const result = await pool.query(query, params);
  return result.rows;
};

export const findCorrectionRequestById = async (id) => {
  const result = await pool.query(
    `SELECT cr.id, cr.student_id AS "studentId", cr.institution_id AS "institutionId", 
            cr.request_text AS "requestText", cr.status, 
            cr.record_id AS "recordId", cr.record_type AS "recordType",
            cr.reviewed_at AS "reviewedAt", cr.rejection_reason AS "rejectionReason", 
            cr.reviewed_by AS "reviewedBy", cr.created_at AS "createdAt",
            s.first_name AS "studentFirstName", s.last_name AS "studentLastName", s.national_id AS "studentNationalId"
     FROM correction_request cr
     JOIN student s ON cr.student_id = s.id
     WHERE cr.id = $1`,
    [id],
  );
  return result.rows[0] || null;
};



export const updateCorrectionRequestStatus = async ({ id, status, reviewedBy, rejectionReason = null }) => {
  const result = await pool.query(
    `UPDATE correction_request
     SET status = $2,
         reviewed_by = $3,
         reviewed_at = CURRENT_TIMESTAMP,
         rejection_reason = $4,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING id, status, reviewed_at AS "reviewedAt", rejection_reason AS "rejectionReason"`,
    [id, status, reviewedBy, rejectionReason],
  );
  return result.rows[0];
};

export const deleteCorrectionRequestsByRecord = async ({ studentId, recordId, recordType, statuses }) => {
  await pool.query(
    `DELETE FROM correction_request 
     WHERE student_id = $1 
       AND record_id = $2 
       AND record_type = $3 
       AND status = ANY($4)`,
    [studentId, recordId, recordType, statuses],
  );
};

export const deleteCorrectionRequestById = async (id) => {
  await pool.query(`DELETE FROM correction_request WHERE id = $1`, [id]);
};


