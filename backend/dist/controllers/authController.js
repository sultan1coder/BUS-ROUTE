"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("../services/authService");
const errorHandler_1 = require("../middleware/errorHandler");
class AuthController {
}
exports.AuthController = AuthController;
_a = AuthController;
// Register new user
AuthController.register = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userData = req.body;
    const result = await authService_1.AuthService.register(userData);
    res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: result,
    });
});
// Login user
AuthController.login = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const loginData = req.body;
    const result = await authService_1.AuthService.login(loginData);
    res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
    });
});
// Refresh access token
AuthController.refreshToken = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        res.status(400).json({
            success: false,
            message: "Refresh token is required",
        });
        return;
    }
    const result = await authService_1.AuthService.refreshToken(refreshToken);
    res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        data: result,
    });
});
// Change password
AuthController.changePassword = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    await authService_1.AuthService.changePassword(userId, currentPassword, newPassword);
    res.status(200).json({
        success: true,
        message: "Password changed successfully",
    });
});
// Get user profile
AuthController.getProfile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const profile = await authService_1.AuthService.getProfile(userId);
    if (!profile) {
        res.status(404).json({
            success: false,
            message: "User profile not found",
        });
        return;
    }
    res.status(200).json({
        success: true,
        data: profile,
    });
});
// Update user profile
AuthController.updateProfile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const updateData = req.body;
    const updatedProfile = await authService_1.AuthService.updateProfile(userId, updateData);
    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: updatedProfile,
    });
});
// Deactivate account
AuthController.deactivateAccount = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    await authService_1.AuthService.deactivateAccount(userId);
    res.status(200).json({
        success: true,
        message: "Account deactivated successfully",
    });
});
// Logout (client-side token removal)
AuthController.logout = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    // In a stateless JWT system, logout is handled client-side
    // Optionally, you could implement token blacklisting here
    res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
});
// Validate token (middleware will handle the actual validation)
AuthController.validateToken = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.status(200).json({
        success: true,
        message: "Token is valid",
        data: {
            user: req.user,
        },
    });
});
//# sourceMappingURL=authController.js.map