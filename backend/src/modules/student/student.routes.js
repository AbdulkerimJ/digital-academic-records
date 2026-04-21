import express from "express";
import { login, getMe, verifyLogin } from "./student.controller.js";
import { protectStudent } from "./student.middleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/verify", verifyLogin);
router.get("/me", protectStudent, getMe);

export default router;
