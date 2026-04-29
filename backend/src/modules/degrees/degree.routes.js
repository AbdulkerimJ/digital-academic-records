import express from "express";
import {
  listDegreeLevels,
  getDegreeLevelById,
  createDegreeLevel,
  updateDegreeLevel,
  listDegreeTitles,
  getDegreeTitleById,
  createDegreeTitle,
  updateDegreeTitle,
  createDegree,
  listDegrees,
  getDegreeById,
  updateDegree,
  deleteDegree,
} from "./degree.controller.js";
import { protectUser, restrictTo } from "../users/user.middleware.js";

const router = express.Router();

router.use(protectUser);

// Degree level lookups
router.get("/levels", listDegreeLevels);
router.get("/levels/:degreeLevelId", getDegreeLevelById);
router.post("/levels", restrictTo("SUPER_ADMIN"), createDegreeLevel);
router.patch("/levels/:degreeLevelId", restrictTo("SUPER_ADMIN"), updateDegreeLevel);

// Degree title lookups
router.get("/titles", listDegreeTitles);
router.get("/titles/:degreeTitleId", getDegreeTitleById);
router.post("/titles", restrictTo("SUPER_ADMIN"), createDegreeTitle);
router.patch("/titles/:degreeTitleId", restrictTo("SUPER_ADMIN"), updateDegreeTitle);


// Degree record CRUD
router.get("/", listDegrees);
router.get("/:degreeId", getDegreeById);
router.post("/", createDegree);
router.patch("/:degreeId", updateDegree);
router.delete("/:degreeId", deleteDegree);

export default router;
