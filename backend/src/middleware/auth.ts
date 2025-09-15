import { Response, NextFunction } from "express";
import { AuthenticatedRequest, UserRole } from "../types";
import { verifyToken, extractTokenFromHeader } from "../utils/jwt";
import prisma from "../config/database";

// Authentication middleware
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access token is required",
      });
      return;
    }

    const decoded = verifyToken(token);

    // Get user details from database
    const user = await prisma.user.findUnique({
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
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// Role-based authorization middleware
export const authorize = (...roles: UserRole[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
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

// Specific role middlewares
export const requireAdmin = authorize(UserRole.ADMIN);
export const requireSchoolStaff = authorize(
  UserRole.ADMIN,
  UserRole.SCHOOL_STAFF
);
export const requireDriver = authorize(
  UserRole.ADMIN,
  UserRole.SCHOOL_STAFF,
  UserRole.DRIVER
);
export const requireDriverOnly = authorize(UserRole.DRIVER);
export const requireParent = authorize(
  UserRole.ADMIN,
  UserRole.SCHOOL_STAFF,
  UserRole.PARENT
);

// Optional authentication (for endpoints that work with or without auth)
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (token) {
      const decoded = verifyToken(token);

      const user = await prisma.user.findUnique({
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
  } catch (error) {
    // Ignore auth errors for optional auth
    next();
  }
};

// School-specific authorization (users can only access their school's data)
export const authorizeSchoolAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
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

    if (req.user?.role === UserRole.ADMIN) {
      hasAccess = true; // Admins can access all schools
    } else if (req.user?.role === UserRole.SCHOOL_STAFF) {
      const staff = await prisma.schoolStaff.findFirst({
        where: {
          userId,
          schoolId,
        },
      });
      hasAccess = !!staff;
    } else if (req.user?.role === UserRole.DRIVER) {
      // Check if driver is assigned to a bus in this school
      const driver = await prisma.driver.findFirst({
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
    } else if (req.user?.role === UserRole.PARENT) {
      // Check if parent has students in this school
      const parent = await prisma.parent.findFirst({
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Authorization check failed",
    });
  }
};
