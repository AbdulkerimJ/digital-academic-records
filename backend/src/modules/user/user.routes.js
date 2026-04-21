import express from "express";
import {
  create,
  changePassword,
  login,
  logout,
  verifyEmail,
  getMe,
} from "./user.controller.js";
import { protectUser } from "./user.middleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.post("/", create);
router.post("/verify-email", verifyEmail);
router.get("/me", protectUser, getMe);
router.patch("/change-password", protectUser, changePassword);

export default router;
