import AppError from "../utils/appError.js";

// ================= DB ERROR HANDLERS =================

// Invalid input (e.g. wrong UUID, wrong type)
const handleInvalidInputDB = () => {
  let message = "Invalid input format. Please check your data.";
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const constraint = err.constraint;

  if (constraint === "app_user_email_key") {
    return new AppError("This email is already in use. Please use a different one.", 400);
  }
  if (constraint === "student_national_id_key") {
    return new AppError("A student with this National ID is already registered.", 400);
  }
  if (constraint === "institution_code_key") {
    return new AppError("An institution with this code already exists.", 400);
  }
  if (constraint === "exams_student_id_exam_level_id_year_institution_id_key") {
    return new AppError("This student already has an exam record for this level and year at this institution.", 400);
  }
  if (constraint?.includes("degrees_student_id")) {
    return new AppError("This student already has a degree record for this title and graduation date.", 400);
  }
  if (constraint?.includes("code_key") || constraint?.includes("name_key")) {
    return new AppError("This record (code or name) already exists in the system.", 400);
  }

  const field = err.detail?.match(/\((.*?)\)/)?.[1] || "field";
  const message = `Duplicate value for ${field}. Please use another value!`;
  return new AppError(message, 400);
};

// Not null violation
const handleNotNullViolationDB = (err) => {
  const message = `Missing required field: ${err.column}`;
  return new AppError(message, 400);
};

const handleForeignKeyViolationDB = (err) => {
  const constraint = err.constraint;
  let message = "This action cannot be completed because this record is linked to other data.";

  if (constraint === "app_user_role_id_fkey") {
    message = "The specified role does not exist.";
  } else if (constraint === "app_user_institution_id_fkey") {
    message = "The specified institution does not exist.";
  } else if (err.detail?.includes("is still referenced")) {
    message = "This record cannot be deleted because it is being used by other parts of the system.";
  } else if (err.detail?.includes("is not present")) {
    message = "The referenced record (Student, Institution, or Level) does not exist.";
  }

  return new AppError(message, 400);
};

const handleCheckViolationDB = (err) => {
  const constraint = err.constraint;
  let message = "The provided data violates system rules.";

  if (constraint === "check_institution_for_non_super_admin") {
    message = "Account policy violation: Super Admins must not have an institution, while other roles MUST have one.";
  } else if (constraint?.includes("result_status_check")) {
    message = "Invalid result status. Must be PASS or FAIL.";
  } else if (constraint === "exams_check") {
    message = "At least one score (Total, Average, or Percentile) must be provided.";
  }

  return new AppError(message, 400);
};

// ================= JWT =================

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired! Please log in again.", 401);

// ================= AXIOS / EXTERNAL API =================

const handleAxiosError = (err) => {
  // Service unreachable (like ECONNREFUSED)
  if (err.code === "ECONNREFUSED") {
    return new AppError(
      "Fayda service is unavailable. Please try again later.",
      503,
    );
  }

  // Server responded with error (4xx, 5xx)
  if (err.response) {
    const message = err.response.data?.message || "Error from external service";
    return new AppError(message, err.response.status || 500);
  }

  // Request made but no response (timeout, network issue)
  if (err.request) {
    return new AppError(
      "No response from external service. Please try again later.",
      504,
    );
  }

  // Unknown Axios error
  return new AppError("External service request failed", 500);
};

// Multer errors
const handleMulterFileSizeError = () =>
  new AppError("File is too large. Please upload a smaller file.", 400);

const handleMulterUnexpectedFileError = (err) =>
  new AppError(
    `Unexpected field: "${err.field}". Please ensure you are using the "file" key and only uploading one file.`,
    400,
  );

const handleMulterGenericError = (err) =>
  new AppError(err.message || "An error occurred during file upload.", 400);

// ================= OTHER =================

const handlePayloadTooLargeError = () =>
  new AppError(
    "Payload too large. Please reduce the size of the request body.",
    413,
  );

// ================= RESPONSE =================

const sendErrorDev = (err, req, res) => {
  res.status(err.statusCode).json({
    success: false,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, req, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  } else {
    console.error("ERROR 💥", err);

    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ================= GLOBAL HANDLER =================

const globalErrorHandler = (err, req, res, next) => {
  if (err.name === "JsonWebTokenError") err = handleJWTError();
  if (err.name === "TokenExpiredError") err = handleJWTExpiredError();

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;

    // PostgreSQL error codes
    if (error.code === "22P02") error = handleInvalidInputDB(error);
    if (error.code === "23505") error = handleDuplicateFieldsDB(error);
    if (error.code === "23502") error = handleNotNullViolationDB(error);
    if (error.code === "23503") error = handleForeignKeyViolationDB(error);
    if (error.code === "23514") error = handleCheckViolationDB(error);

    // Multer
    if (error.code === "LIMIT_FILE_SIZE") error = handleMulterFileSizeError();
    if (error.code === "LIMIT_UNEXPECTED_FILE") error = handleMulterUnexpectedFileError(error);
    if (error.name === "MulterError") error = handleMulterGenericError(error);

    // Other
    if (error.type === "entity.too.large") error = handlePayloadTooLargeError();

    // Axios
    if (error.isAxiosError) error = handleAxiosError(error);

    sendErrorProd(error, req, res);
  }
};

export default globalErrorHandler;
