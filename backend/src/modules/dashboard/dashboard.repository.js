import pool from "../../common/config/pool.js";

export const getSuperAdminStats = async () => {
  const stats = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM institution) AS "totalInstitutions",
      (SELECT COUNT(*) FROM student) AS "totalStudents",
      (SELECT COUNT(*) FROM exams) AS "totalExams",
      (SELECT COUNT(*) FROM degrees) AS "totalDegrees",
      (SELECT COUNT(*) FROM correction_request WHERE status = 'PENDING') AS "pendingCorrections"
  `);
  return stats.rows[0];
};

export const getInstitutionAdminStats = async (institutionId) => {
  const stats = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM student s 
       WHERE EXISTS (SELECT 1 FROM exams e WHERE e.student_id = s.id AND e.institution_id = $1)
          OR EXISTS (SELECT 1 FROM degrees d WHERE d.student_id = s.id AND d.institution_id = $1)
      ) AS "totalStudents",
      (SELECT COUNT(*) FROM exams WHERE institution_id = $1) AS "totalExams",
      (SELECT COUNT(*) FROM degrees WHERE institution_id = $1) AS "totalDegrees",
      (SELECT COUNT(*) FROM correction_request cr
       JOIN student s ON cr.student_id = s.id
       WHERE cr.status = 'PENDING' 
       AND (
         EXISTS (SELECT 1 FROM exams e WHERE e.student_id = s.id AND e.institution_id = $1)
         OR EXISTS (SELECT 1 FROM degrees d WHERE d.student_id = s.id AND d.institution_id = $1)
       )
      ) AS "pendingCorrections"
  `, [institutionId]);
  return stats.rows[0];
};

export const getRecentActivities = async (limit = 5) => {
  // This could be from an audit_log table if we had one populated
  // For now, let's get recent degrees/exams
  const activities = await pool.query(`
    (SELECT 'degree' as type, d.created_at, s.first_name || ' ' || s.last_name as student, i.name as institution
     FROM degrees d
     JOIN student s ON d.student_id = s.id
     JOIN institution i ON d.institution_id = i.id
     ORDER BY d.created_at DESC LIMIT $1)
    UNION ALL
    (SELECT 'exam' as type, e.created_at, s.first_name || ' ' || s.last_name as student, i.name as institution
     FROM exams e
     JOIN student s ON e.student_id = s.id
     JOIN institution i ON e.institution_id = i.id
     ORDER BY e.created_at DESC LIMIT $1)
    ORDER BY created_at DESC LIMIT $1
  `, [limit]);
  return activities.rows;
};
