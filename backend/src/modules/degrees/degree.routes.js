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
  uploadBulkDegrees,
} from "./degree.controller.js";
import { protectUser, restrictTo } from "../users/user.middleware.js";
import upload from "../../common/utils/upload.js";

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
router.patch("/:degreeId", updateDegree);

router.post("/", createDegree);
router.post(
  "/upload-bulk",
  restrictTo("SUPER_ADMIN", "REGISTRAR"),
  upload.single("file"),
  uploadBulkDegrees,
);
router.delete("/:degreeId", deleteDegree);

export default router;
