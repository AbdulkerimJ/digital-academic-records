import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";

import swaggerSpec from "./common/config/swagger.js";
import AppError from "./common/utils/appError.js";
import globalErrorHandler from "./common/controllers/error.controller.js";

import studentRoutes from "./modules/students/student.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import getCitizenRoutes from "./modules/citizens/citizen.routes.js";
import institutionRoutes from "./modules/institutions/institution.routes.js";
import examRoutes from "./modules/exams/exam.routes.js";
import degreeRoutes from "./modules/degrees/degree.routes.js";
import correctionRequestRoutes from "./modules/correction-requests/correction-request.routes.js";
import qrRoutes from "./modules/qr/qr.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import auditRoutes from "./modules/audit/audit.routes.js";
import { globalLimiter } from "./common/middlewares/rateLimiter.js";


const app = express();

app.set("trust proxy", 1); // Enable proxy trust so req.ip has the real client IP

// Apply rate limiting to all /api routes
app.use("/api", globalLimiter);

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "https://digital-academic-records.vercel.app",
    "https://digital-academic-records-public.vercel.app"
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// swagger-ui setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// routes
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Welcome to the Digital Academic Records API",
  });
});
app.use("/api/students", studentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/citizens", getCitizenRoutes);
app.use("/api/institutions", institutionRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/degrees", degreeRoutes);
app.use("/api/correction-requests", correctionRequestRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/audit-logs", auditRoutes);


// unmatched routes
app.use((req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
