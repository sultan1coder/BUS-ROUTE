"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeSchoolAccess = exports.optionalAuth = exports.requireParent = exports.requireDriverOnly = exports.requireDriver = exports.requireSchoolStaff = exports.requireAdmin = exports.authorize = exports.authenticate = void 0;
const types_1 = require("../types");
const jwt_1 = require("../utils/jwt");
const database_1 = __importDefault(require("../config/database"));
// Authentication middleware
const authenticate = async (req, res, next) => {
    try {
        const token = (0, jwt_1.extractTokenFromHeader)(req.headers.authorization);
        if (!token) {
            res.status(401).json({
                success: false,
                message: "Access token is required",
            });
            return;
        }
        const decoded = (0, jwt_1.verifyToken)(token);
        // Get user details from database
        const user = await database_1.default.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                role: true,
                firstName: true,
                lastName: true,
                isActive: true,
            },
        });
        if (!user || !user.isActive) {
            res.status(401).json({
                success: false,
                message: "User not found or inactive",
            });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};
exports.authenticate = authenticate;
// Role-based authorization middleware
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: "Authentication required",
            });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: "Insufficient permissions",
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
// Specific role middlewares
exports.requireAdmin = (0, exports.authorize)(types_1.UserRole.ADMIN);
exports.requireSchoolStaff = (0, exports.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.SCHOOL_STAFF);
exports.requireDriver = (0, exports.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.SCHOOL_STAFF, types_1.UserRole.DRIVER);
exports.requireDriverOnly = (0, exports.authorize)(types_1.UserRole.DRIVER);
exports.requireParent = (0, exports.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.SCHOOL_STAFF, types_1.UserRole.PARENT);
// Optional authentication (for endpoints that work with or without auth)
const optionalAuth = async (req, res, next) => {
    try {
        const token = (0, jwt_1.extractTokenFromHeader)(req.headers.authorization);
        if (token) {
            const decoded = (0, jwt_1.verifyToken)(token);
            const user = await database_1.default.user.findUnique({
                where: { id: decoded.id },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    firstName: true,
                    lastName: true,
                    isActive: true,
                },
            });
            if (user && user.isActive) {
                req.user = user;
            }
        }
        next();
    }
    catch (error) {
        // Ignore auth errors for optional auth
        next();
    }
};
exports.optionalAuth = optionalAuth;
// School-specific authorization (users can only access their school's data)
const authorizeSchoolAccess = async (req, res, next) => {
    try {
        const { schoolId } = req.params;
        const userId = req.user?.id;
        if (!userId || !schoolId) {
            res.status(400).json({
                success: false,
                message: "User ID and school ID are required",
            });
            return;
        }
        // Check if user has access to this school
        let hasAccess = false;
        if (req.user?.role === types_1.UserRole.ADMIN) {
            hasAccess = true; // Admins can access all schools
        }
        else if (req.user?.role === types_1.UserRole.SCHOOL_STAFF) {
            const staff = await database_1.default.schoolStaff.findFirst({
                where: {
                    userId,
                    schoolId,
                },
            });
            hasAccess = !!staff;
        }
        else if (req.user?.role === types_1.UserRole.DRIVER) {
            // Check if driver is assigned to a bus in this school
            const driver = await database_1.default.driver.findFirst({
                where: { userId },
                include: {
                    bus: {
                        select: {
                            schoolId: true,
                        },
                    },
                },
            });
            hasAccess = driver?.bus?.schoolId === schoolId;
        }
        else if (req.user?.role === types_1.UserRole.PARENT) {
            // Check if parent has students in this school
            const parent = await database_1.default.parent.findFirst({
                where: { userId },
                include: {
                    students: {
                        where: { schoolId },
                        select: { id: true },
                    },
                },
            });
            hasAccess = (parent?.students.length ?? 0) > 0;
        }
        if (!hasAccess) {
            res.status(403).json({
                success: false,
                message: "Access denied to this school",
            });
            return;
        }
        next();
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Authorization check failed",
        });
    }
};
exports.authorizeSchoolAccess = authorizeSchoolAccess;
//# sourceMappingURL=auth.js.map