import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

import swaggerSpec from "./config/swagger.js";
import AppError from "./utils/appError.js";
import globalErrorHandler from "./controllers/error.controller.js";

import authRoutes from "./routes/auth.routes.js";
import getCitizenRoutes from "./routes/citizen.routes.js";

const app = express();

// app.use(cors());
app.use(express.json());

// swagger-ui setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/citizens", getCitizenRoutes);

app.use((req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
export default app;
