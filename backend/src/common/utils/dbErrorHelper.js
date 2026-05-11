import AppError from "./appError.js";

/**
 * Translates low-level database errors (PostgreSQL) into user-friendly AppError objects.
 * This is used by the global error controller and bulk upload services to provide consistent feedback.
 */
export const translateDatabaseError = (err) => {
  const code = err.code;
  const constraint = err.constraint || "";
  const message = err.message || "";

  // 1. DUPLICATE KEY VIOLATIONS (23505)
  if (code === "23505" || message.includes("unique constraint")) {
    if (constraint.includes("app_user_email_key")) {
      return new AppError("This email is already in use. Please use a different one.", 400);
    }
    if (constraint.includes("student_national_id_key")) {
      return new AppError("A student with this National ID is already registered.", 400);
    }
    if (constraint.includes("institution_code_key")) {
      return new AppError("An institution with this code already exists.", 400);
    }
    if (constraint.includes("exams_student_id") || constraint.includes("exams_pkey")) {
      return new AppError("This student already has an exam record for this level and year at this institution.", 400);
    }
    if (constraint.includes("degrees_student_id") || constraint.includes("degrees_pkey")) {
      return new AppError("This student already has a degree record for this title at this institution.", 400);
    }
    if (constraint.includes("college_institution_id_code_key")) {
      return new AppError("A college with this code already exists in this institution.", 400);
    }
    if (constraint.includes("college_institution_id_name_key")) {
      return new AppError("A college with this name already exists in this institution.", 400);
    }
    if (constraint.includes("department_college_id_code_key")) {
      return new AppError("A department with this code already exists in this college.", 400);
    }
    if (constraint.includes("department_college_id_name_key")) {
      return new AppError("A department with this name already exists in this college.", 400);
    }
    if (constraint.includes("code_key") || constraint.includes("name_key")) {
      return new AppError("This record (code or name) already exists in the system.", 400);
    }

    const field = err.detail?.match(/\((.*?)\)/)?.[1] || "field";
    return new AppError(`Duplicate value for ${field}. Please use another value!`, 400);
  }

  // 2. NOT NULL VIOLATIONS (23502)
  if (code === "23502") {
    return new AppError(`Missing required field: ${err.column || "unknown"}`, 400);
  }

  // 3. FOREIGN KEY VIOLATIONS (23503)
  if (code === "23503") {
    // If we're trying to DELETE a record that is still being used elsewhere
    if (err.detail?.includes("is still referenced")) {
      if (constraint.includes("app_user")) return new AppError("This record cannot be deleted because it is linked to one or more Users.", 400);
      if (constraint.includes("exams")) return new AppError("This record cannot be deleted because it has associated Exam records.", 400);
      if (constraint.includes("degrees")) return new AppError("This record cannot be deleted because it has associated Degree records.", 400);
      if (constraint.includes("colleges")) return new AppError("This record cannot be deleted because it has associated Colleges.", 400);
      if (constraint.includes("departments")) return new AppError("This record cannot be deleted because it has associated Departments.", 400);
      
      return new AppError("This record cannot be deleted because it is being used by other parts of the system.", 400);
    }

    // If we're trying to INSERT/UPDATE a record with a non-existent reference
    if (err.detail?.includes("is not present")) {
      if (constraint === "app_user_role_id_fkey") {
        return new AppError("The specified role does not exist.", 400);
      }
      if (constraint === "app_user_institution_id_fkey") {
        return new AppError("The specified institution does not exist.", 400);
      }
      return new AppError("The referenced record (Student, Institution, or Level) does not exist.", 400);
    }

    return new AppError("This action cannot be completed because of a linked record issue.", 400);
  }

  // 4. CHECK VIOLATIONS (23514)
  if (code === "23514") {
    if (constraint === "check_institution_for_non_super_admin") {
      return new AppError("Account policy violation: Super Admins must not have an institution, while other roles MUST have one.", 400);
    }
    if (constraint.includes("result_status_check")) {
      return new AppError("Invalid result status. Must be PASS or FAIL.", 400);
    }
    if (constraint === "exams_check") {
      return new AppError("At least one score (Total, Average, or Percentile) must be provided.", 400);
    }
    return new AppError("The provided data violates system rules.", 400);
  }

  // 5. INVALID INPUT (22P02)
  if (code === "22P02") {
    return new AppError("Invalid input format. Please check your data types.", 400);
  }

  // If no mapping found, return null so the caller can decide what to do
  return null;
};
