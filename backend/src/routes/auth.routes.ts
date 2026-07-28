import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { validateBody } from "../middleware/validate.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  tokenSchema
} from "../validators/auth.validator.js";

const router = Router();
const authController = new AuthController();

router.post("/register", validateBody(registerSchema), asyncHandler(authController.register));
router.post("/login", validateBody(loginSchema), asyncHandler(authController.login));
router.post("/refresh-token", asyncHandler(authController.refreshToken));
router.post("/logout", asyncHandler(authController.logout));
router.post("/verify-email", validateBody(tokenSchema), asyncHandler(authController.verifyEmail));
router.post("/forgot-password", validateBody(forgotPasswordSchema), asyncHandler(authController.forgotPassword));
router.post("/reset-password", validateBody(resetPasswordSchema), asyncHandler(authController.resetPassword));
router.get("/me", authenticate, asyncHandler(authController.me));

export { router as authRoutes };

