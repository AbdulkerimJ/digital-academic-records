import {
  getMe,
  getMyExams,
  getMyDegrees,
  listStudents,
  getStudentById,
} from "./student.controller.js";

import {
  login,
  logout,
  refresh,
  verifyLogin,
} from "./auth.controller.js";
import { protectStudent } from "./student.middleware.js";
import { protectUser } from "../users/user.middleware.js";
import { submitRequest, getMyRequests } from "../correction-requests/correction-request.controller.js";

const router = express.Router();

// Auth
router.post("/login", login);
router.post("/verify", verifyLogin);
router.post("/refresh", refresh);
router.post("/logout", protectStudent, logout);

// Student Profile & Records
router.get("/me", protectStudent, getMe);
router.get("/me/exams", protectStudent, getMyExams);

router.get("/me/degrees", protectStudent, getMyDegrees);

// Correction Requests (Student facing)
router.post("/correction-requests", protectStudent, submitRequest);
router.get("/correction-requests", protectStudent, getMyRequests);

// Admin Student Management
router.get("/", protectUser, listStudents);
router.get("/:id", protectUser, getStudentById);



export default router;
