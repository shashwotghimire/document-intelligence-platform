import { Router } from "express";
import {
  blockUser,
  getAllUsers,
  getUser,
  loginUser,
  registerUser,
  unblockUser,
  updateProfile,
  verifyEmail,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import {
  loginUserSchema,
  registerUserSchema,
  updateProfileSchema,
} from "../validation/auth.validation";
import { rolesGuard } from "../middlewares/roles.middleware";

const router: Router = Router();

router.post("/register", validate(registerUserSchema), registerUser);
router.post("/login", validate(loginUserSchema), loginUser);
router.get("/me", authMiddleware, getUser);
router.patch(
  "/profile",
  authMiddleware,
  validate(updateProfileSchema),
  updateProfile,
);
router.get("/verify", verifyEmail);
router.patch("/block/:userId", authMiddleware, rolesGuard("admin"), blockUser);
router.patch("/block/:userId", authMiddleware, rolesGuard("admin"), blockUser);
router.patch(
  "/unblock/:userId",
  authMiddleware,
  rolesGuard("admin"),
  unblockUser,
);
router.get("/users", authMiddleware, rolesGuard("admin"), getAllUsers);

export default router;
