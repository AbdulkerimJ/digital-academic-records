import multer from "multer";
import AppError from "./appError.js";

// We use memory storage because we don't need to persist the file on disk,
// just parse it and discard it.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow only CSV files
  if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
    cb(null, true);
  } else {
    cb(new AppError("Only CSV files are allowed!", 400), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export default upload;
