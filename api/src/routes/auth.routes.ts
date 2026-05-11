import { Router } from "express";
import {
  getUser,
  loginUser,
  registerUser,
  verifyEmail,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import {
  loginUserSchema,
  registerUserSchema,
} from "../validation/auth.validation";

const router: Router = Router();

router.post("/register", validate(registerUserSchema), registerUser);
router.post("/login", validate(loginUserSchema), loginUser);
router.get("/me", authMiddleware, getUser);
router.get("/verify", verifyEmail);

export default router;
