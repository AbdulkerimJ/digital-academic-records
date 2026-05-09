import express from "express";
import {
  activateInvite,
  changePassword,
  login,
  logout,
  getMe,
  refresh,
} from "./auth.controller.js";
import {
  create,
  getUserById,
  list,
  listRoles,
  remove,
  resendInvite,
  revokeInvite,
  suspend,
  unsuspend,
  updateMe,
  update,
} from "./user.controller.js";
import { protectUser, restrictTo } from "./user.middleware.js";
import { authLimiter } from "../../common/middlewares/rateLimiter.js";

const router = express.Router();

router.post("/login", authLimiter, login);
router.post("/refresh", refresh);
router.post("/logout", protectUser, logout);
router.post("/activate-invite", authLimiter, activateInvite);
router.get("/roles", protectUser, restrictTo("SUPER_ADMIN"), listRoles);
router.get("/", protectUser, restrictTo("SUPER_ADMIN"), list);
router.post("/", protectUser, restrictTo("SUPER_ADMIN"), create);
router.get("/me", protectUser, getMe);
router.patch("/me", protectUser, updateMe);
router.patch("/change-password", protectUser, changePassword);
router.get("/:userId", protectUser, restrictTo("SUPER_ADMIN"), getUserById);
router.post(
  "/:userId/resend-invite",
  protectUser,
  restrictTo("SUPER_ADMIN"),
  resendInvite,
);
router.patch(
  "/:userId/revoke-invite",
  protectUser,
  restrictTo("SUPER_ADMIN"),
  revokeInvite,
);
router.patch(
  "/:userId/suspend",
  protectUser,
  restrictTo("SUPER_ADMIN"),
  suspend,
);
router.patch(
  "/:userId/unsuspend",
  protectUser,
  restrictTo("SUPER_ADMIN"),
  unsuspend,
);
router.patch("/:userId", protectUser, restrictTo("SUPER_ADMIN"), update);
router.delete("/:userId", protectUser, restrictTo("SUPER_ADMIN"), remove);

export default router;
