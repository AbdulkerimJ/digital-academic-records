import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";

import swaggerSpec from "./config/swagger.js";
import AppError from "./utils/appError.js";
import globalErrorHandler from "./controllers/error.controller.js";

import studentRoutes from "./routes/student.routes.js";
import userRoutes from "./routes/user.routes.js";
import getCitizenRoutes from "./routes/citizen.routes.js";
import institutionRoutes from "./routes/institution.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// swagger-ui setup
app.use("/app/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// routes
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Welcome to the Fayda API",
  });
});
app.use("/app/api/students", studentRoutes);
app.use("/app/api/users", userRoutes);
app.use("/app/api/citizens", getCitizenRoutes);
app.use("/app/api/institutions", institutionRoutes);

// unmatched routes
app.use((req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
