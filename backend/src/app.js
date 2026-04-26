import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";

import swaggerSpec from "./common/config/swagger.js";
import AppError from "./common/utils/appError.js";
import globalErrorHandler from "./common/controllers/error.controller.js";

import studentRoutes from "./modules/student/student.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import getCitizenRoutes from "./modules/citizen/citizen.routes.js";
import institutionRoutes from "./modules/institution/institution.routes.js";
import examRoutes from "./modules/exam/exam.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
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

// unmatched routes
app.use((req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
