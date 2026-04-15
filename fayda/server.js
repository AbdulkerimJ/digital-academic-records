import express from "express";
import swaggerUi from "swagger-ui-express";
import citizenRoutes from "./routes/citizen.routes.js";
import authRoutes from "./routes/auth.routes.js";
import swaggerSpec from "./config/swagger.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(express.json());

// Routes
app.use("/api/citizens", citizenRoutes);
app.use("/api/auth", authRoutes);

// Swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: false,
    message: `Route ${req.originalUrl} not found`,
  });
});
// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Fayda Server running on port ${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
