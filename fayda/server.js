import express from "express";
import citizenRoutes from "./routes/citizen.routes.js";
import authRoutes from "./routes/auth.routes.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(express.json());

// Routes
app.use("/api/citizens", citizenRoutes);
app.use("/api/auth", authRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: false,
    message: `Route ${req.originalUrl} not found`,
  });
});
// Start server
const PORT = process.env.PORT || 9000;

app.listen(PORT, () => {
  console.log(`🚀 Fayda Server running on port ${PORT}`);
});
