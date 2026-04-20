import express from "express";
import {
  create,
  changePassword,
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
router.patch("/change-password", protectUser, changePassword);

export default router;
