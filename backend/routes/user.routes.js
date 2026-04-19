import express from "express";
import {
  create,
  login,
  verifyEmail,
  getMe,
} from "../controllers/user.controller.js";
import { protectUser } from "../middleware/user.middleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/", create);
router.post("/verify-email", verifyEmail);
router.get("/me", protectUser, getMe);

export default router;
