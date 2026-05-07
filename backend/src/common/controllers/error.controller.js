import AppError from "../utils/appError.js";
import { translateDatabaseError } from "../utils/dbErrorHelper.js";

// (DB Error handlers removed - moved to dbErrorHelper.js)

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
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  let error = err;
  // Ensure we have a message
  if (!error.message) error.message = "An unexpected error occurred.";

  // 1. Handle specific known error types
  if (error.name === "JsonWebTokenError") error = handleJWTError();
  if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
  if (error.name === "MulterError") error = handleMulterGenericError(error);
  if (error.isAxiosError) error = handleAxiosError(error);
  if (error.type === "entity.too.large") error = handlePayloadTooLargeError();

  // 2. Handle PostgreSQL error codes (Always)
  const translated = translateDatabaseError(error);
  if (translated) {
    error = translated;
  }

  // 3. Handle specific codes (Multer etc)
  const errCode = error.code || err.code;
  if (errCode === "LIMIT_FILE_SIZE") error = handleMulterFileSizeError();
  if (errCode === "LIMIT_UNEXPECTED_FILE") error = handleMulterUnexpectedFileError(error);

  // 4. Send Response
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(error, req, res);
  } else {
    sendErrorProd(error, req, res);
  }
};

export default globalErrorHandler;
