import express from "express";
import {
  createInstitution,
  getInstitutionById,
  listInstitutions,
  updateInstitution,
} from "./institution.controller.js";
import { protectUser, restrictTo } from "../user/user.middleware.js";

const router = express.Router();

router.get("/", protectUser, restrictTo("SUPER_ADMIN"), listInstitutions);
router.post("/", protectUser, restrictTo("SUPER_ADMIN"), createInstitution);
router.get(
  "/:institutionId",
  protectUser,
  restrictTo("SUPER_ADMIN"),
  getInstitutionById,
);
router.patch(
  "/:institutionId",
  protectUser,
  restrictTo("SUPER_ADMIN"),
  updateInstitution,
);

export default router;
