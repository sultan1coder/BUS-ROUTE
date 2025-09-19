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
        console.log("🔑 Authentication middleware:", {
            method: req.method,
            url: req.url,
            hasAuthHeader: !!req.headers.authorization,
            authHeader: req.headers.authorization ? "Present (hidden)" : "Missing",
        });
        const token = (0, jwt_1.extractTokenFromHeader)(req.headers.authorization);
        console.log("🔑 Extracted token:", token ? "Present" : "Missing");
        if (!token) {
            console.log("❌ No token provided");
            res.status(401).json({
                success: false,
                message: "Access token is required",
            });
            return;
        }
        const decoded = (0, jwt_1.verifyToken)(token);
        console.log("🔑 Token decoded:", {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
        });
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
        console.log("🔑 User lookup result:", {
            userFound: !!user,
            isActive: user?.isActive,
            userRole: user?.role,
        });
        if (!user || !user.isActive) {
            console.log("❌ User not found or inactive");
            res.status(401).json({
                success: false,
                message: "User not found or inactive",
            });
            return;
        }
        req.user = user;
        console.log("✅ Authentication successful - user attached to request");
        next();
    }
    catch (error) {
        console.log("❌ Authentication error:", error instanceof Error ? error.message : String(error));
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
        console.log("🔐 Auth middleware debug:", {
            hasUser: !!req.user,
            userRole: req.user?.role,
            userRoleType: typeof req.user?.role,
            requiredRoles: roles,
            rolesMatch: req.user ? roles.includes(req.user.role) : false,
            method: req.method,
            url: req.url,
            headers: {
                authorization: req.headers.authorization ? "Present" : "Missing",
                contentType: req.headers["content-type"],
            },
        });
        if (!req.user) {
            console.log("❌ Auth middleware: No user found in request");
            res.status(401).json({
                success: false,
                message: "Authentication required",
            });
            return;
        }
        if (!roles.includes(req.user.role)) {
            console.log("❌ Auth middleware: Role not authorized", {
                userRole: req.user.role,
                requiredRoles: roles,
            });
            res.status(403).json({
                success: false,
                message: "Insufficient permissions",
            });
            return;
        }
        console.log("✅ Auth middleware: Authorization successful");
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