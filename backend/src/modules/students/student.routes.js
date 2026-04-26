import express from "express";
import {
  getMe,
  login,
  logout,
  refresh,
  verifyLogin,
} from "./auth.controller.js";
import { protectStudent } from "./student.middleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/verify", verifyLogin);
router.post("/refresh", refresh);
router.post("/logout", protectStudent, logout);
router.get("/me", protectStudent, getMe);

export default router;
