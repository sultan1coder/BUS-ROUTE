"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const database_1 = __importDefault(require("../config/database"));
const jwt_1 = require("../utils/jwt");
const password_1 = require("../utils/password");
const errorHandler_1 = require("../middleware/errorHandler");
class AuthService {
    // Register a new user
    static async register(userData) {
        const { email, password, firstName, lastName, role, phone } = userData;
        // Check if user already exists
        const existingUser = await database_1.default.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new errorHandler_1.CustomError("User with this email already exists", 409);
        }
        // Validate password strength
        const passwordValidation = (0, password_1.validatePasswordStrength)(password);
        if (!passwordValidation.isValid) {
            throw new errorHandler_1.CustomError(`Password validation failed: ${passwordValidation.errors.join(", ")}`, 400);
        }
        // Hash password
        const hashedPassword = await (0, password_1.hashPassword)(password);
        // Create user
        const user = await database_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role,
                phone,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                phone: true,
                isActive: true,
                createdAt: true,
            },
        });
        // Generate tokens
        const accessToken = (0, jwt_1.generateToken)({
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
        });
        const refreshToken = (0, jwt_1.generateRefreshToken)({ id: user.id });
        return {
            user,
            accessToken,
            refreshToken,
        };
    }
    // Login user
    static async login(loginData) {
        const { email, password } = loginData;
        // Find user by email
        const user = await database_1.default.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                password: true,
                firstName: true,
                lastName: true,
                role: true,
                phone: true,
                isActive: true,
                lastLogin: true,
            },
        });
        if (!user || !user.isActive) {
            throw new errorHandler_1.CustomError("Invalid email or password", 401);
        }
        // Verify password
        const isPasswordValid = await (0, password_1.verifyPassword)(password, user.password);
        if (!isPasswordValid) {
            throw new errorHandler_1.CustomError("Invalid email or password", 401);
        }
        // Update last login
        await database_1.default.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });
        // Generate tokens
        const accessToken = (0, jwt_1.generateToken)({
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
        });
        const refreshToken = (0, jwt_1.generateRefreshToken)({ id: user.id });
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            accessToken,
            refreshToken,
        };
    }
    // Refresh access token
    static async refreshToken(refreshToken) {
        try {
            const decoded = (0, jwt_1.verifyRefreshToken)(refreshToken);
            const user = await database_1.default.user.findUnique({
                where: { id: decoded.id },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    isActive: true,
                },
            });
            if (!user || !user.isActive) {
                throw new errorHandler_1.CustomError("User not found or inactive", 401);
            }
            const accessToken = (0, jwt_1.generateToken)({
                id: user.id,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
            });
            const newRefreshToken = (0, jwt_1.generateRefreshToken)({ id: user.id });
            return {
                accessToken,
                refreshToken: newRefreshToken,
            };
        }
        catch (error) {
            throw new errorHandler_1.CustomError("Invalid refresh token", 401);
        }
    }
    // Change password
    static async changePassword(userId, currentPassword, newPassword) {
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                password: true,
            },
        });
        if (!user) {
            throw new errorHandler_1.CustomError("User not found", 404);
        }
        // Verify current password
        const isCurrentPasswordValid = await (0, password_1.verifyPassword)(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            throw new errorHandler_1.CustomError("Current password is incorrect", 400);
        }
        // Validate new password strength
        const passwordValidation = (0, password_1.validatePasswordStrength)(newPassword);
        if (!passwordValidation.isValid) {
            throw new errorHandler_1.CustomError(`Password validation failed: ${passwordValidation.errors.join(", ")}`, 400);
        }
        // Hash new password
        const hashedNewPassword = await (0, password_1.hashPassword)(newPassword);
        // Update password
        await database_1.default.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword },
        });
    }
    // Get user profile
    static async getProfile(userId) {
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                phone: true,
                avatar: true,
                isActive: true,
                lastLogin: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return user;
    }
    // Update user profile
    static async updateProfile(userId, updateData) {
        const user = await database_1.default.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                phone: true,
                avatar: true,
                isActive: true,
                lastLogin: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return user;
    }
    // Deactivate user account
    static async deactivateAccount(userId) {
        await database_1.default.user.update({
            where: { id: userId },
            data: { isActive: false },
        });
    }
    // Validate user exists and is active
    static async validateUser(userId) {
        return await database_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
            },
        });
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=authService.js.map