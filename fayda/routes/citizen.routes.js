import express from "express";
import getCitizenByFaydaId  from "../controllers/citizen.controller.js";

const router = express.Router();

// GET /api/citizens/:faydaId
router.get("/:faydaId", getCitizenByFaydaId);

export default router;