import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { authenticate } from "../middleware/auth";
import {
  validateUserRegistration,
  validateUserLogin,
  validatePasswordChange,
  handleValidationErrors,
} from "../middleware/validation";

const router = Router();

// Public routes
router.post(
  "/register",
  validateUserRegistration,
  handleValidationErrors,
  AuthController.register
);

router.post(
  "/login",
  validateUserLogin,
  handleValidationErrors,
  AuthController.login
);

router.post("/refresh-token", AuthController.refreshToken);

// Protected routes (require authentication)
router.use(authenticate); // All routes below require authentication

router.post(
  "/change-password",
  validatePasswordChange,
  handleValidationErrors,
  AuthController.changePassword
);

router.get("/profile", AuthController.getProfile);

router.put("/profile", AuthController.updateProfile);

router.delete("/account", AuthController.deactivateAccount);

router.post("/logout", AuthController.logout);

router.get("/validate-token", AuthController.validateToken);

export default router;
