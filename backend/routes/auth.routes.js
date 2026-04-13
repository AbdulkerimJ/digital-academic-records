import express from "express";
import { login, verifyLogin } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", login);
router.post("/verify", verifyLogin);

export default router;