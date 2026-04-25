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
  remove,
  resendInvite,
  revokeInvite,
  suspend,
  unsuspend,
  update,
} from "./user.controller.js";
import { protectUser, restrictTo } from "./user.middleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", protectUser, logout);
router.post("/activate-invite", activateInvite);
router.get("/", protectUser, restrictTo("SUPER_ADMIN"), list);
router.post("/", protectUser, restrictTo("SUPER_ADMIN"), create);
router.get("/me", protectUser, getMe);
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
router.patch("/change-password", protectUser, changePassword);

export default router;
