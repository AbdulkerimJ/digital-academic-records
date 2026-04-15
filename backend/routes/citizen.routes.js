import express from "express";
import getCitizenByFaydaId from "../controllers/citizen.controller.js";
const router = express.Router();

router.get("/:faydaId", getCitizenByFaydaId);

export default router;