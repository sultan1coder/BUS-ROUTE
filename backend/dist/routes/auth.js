"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// Public routes
router.post("/register", validation_1.validateUserRegistration, validation_1.handleValidationErrors, authController_1.AuthController.register);
router.post("/login", validation_1.validateUserLogin, validation_1.handleValidationErrors, authController_1.AuthController.login);
router.post("/refresh-token", authController_1.AuthController.refreshToken);
// Protected routes (require authentication)
router.use(auth_1.authenticate); // All routes below require authentication
router.post("/change-password", validation_1.validatePasswordChange, validation_1.handleValidationErrors, authController_1.AuthController.changePassword);
router.get("/profile", authController_1.AuthController.getProfile);
router.put("/profile", authController_1.AuthController.updateProfile);
router.delete("/account", authController_1.AuthController.deactivateAccount);
router.post("/logout", authController_1.AuthController.logout);
router.get("/validate-token", authController_1.AuthController.validateToken);
exports.default = router;
//# sourceMappingURL=auth.js.map