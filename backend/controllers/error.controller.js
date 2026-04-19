import AppError from "../utils/appError.js";

// ================= DB ERROR HANDLERS =================

// Invalid input (e.g. wrong UUID, wrong type)
const handleInvalidInputDB = (err) => {
  const message = `Invalid input: ${err.detail || err.message}`;
  return new AppError(message, 400);
};

// Duplicate value (UNIQUE constraint)
const handleDuplicateFieldsDB = (err) => {
  const field = err.detail?.match(/\((.*?)\)/)?.[1];
  const message = `Duplicate field value: ${field}. Please use another value!`;
  return new AppError(message, 400);
};

// Not null violation
const handleNotNullViolationDB = (err) => {
  const message = `Missing required field: ${err.column}`;
  return new AppError(message, 400);
};

// Foreign key violation
const handleForeignKeyViolationDB = (err) => {
  const message = `Invalid reference: ${err.detail}`;
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

    // JWT
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    // Payload
    if (error.type === "entity.too.large") error = handlePayloadTooLargeError();

    // Axios / External API
    if (error.isAxiosError) error = handleAxiosError(error);

    sendErrorProd(error, req, res);
  }
};

export default globalErrorHandler;
