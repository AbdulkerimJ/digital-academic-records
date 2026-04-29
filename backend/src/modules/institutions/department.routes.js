import express from "express";
import {
  listDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "./institution.structure.controller.js";
import { protectUser } from "../users/user.middleware.js";

const router = express.Router({ mergeParams: true });

router.use(protectUser);

router.get("/", listDepartments);
router.get("/:departmentId", getDepartmentById);
router.post("/", createDepartment);
router.patch("/:departmentId", updateDepartment);
router.delete("/:departmentId", deleteDepartment);

export default router;
