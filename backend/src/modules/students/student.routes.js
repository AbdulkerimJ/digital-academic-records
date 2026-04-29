import express from "express";
import {
  getMe,
  login,
  logout,
  refresh,
  verifyLogin,
} from "./auth.controller.js";
import { protectStudent } from "./student.middleware.js";
import { submitRequest, getMyRequests } from "../correction-requests/correction-request.controller.js";

const router = express.Router();

router.post("/login", login);
router.post("/verify", verifyLogin);
router.post("/refresh", refresh);
router.post("/logout", protectStudent, logout);
router.get("/me", protectStudent, getMe);

// Correction Requests
router.post("/correction-requests", protectStudent, submitRequest);
router.get("/correction-requests", protectStudent, getMyRequests);


export default router;
