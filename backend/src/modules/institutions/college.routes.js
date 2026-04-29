import express from "express";
import {
  listColleges,
  getCollegeById,
  createCollege,
  updateCollege,
  deleteCollege,
} from "./institution.structure.controller.js";
import { protectUser } from "../users/user.middleware.js";
import departmentRoutes from "./department.routes.js";

// Note: This router is intended to be mounted with mergeParams: true
// so it can access institutionId from the parent route.
const router = express.Router({ mergeParams: true });

router.use(protectUser);

router.get("/", listColleges);
router.get("/:collegeId", getCollegeById);
router.post("/", createCollege);
router.patch("/:collegeId", updateCollege);
router.delete("/:collegeId", deleteCollege);

router.use("/:collegeId/departments", departmentRoutes);

export default router;
