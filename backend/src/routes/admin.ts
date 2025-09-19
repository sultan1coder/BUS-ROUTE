import { Router } from "express";
import { AdminController } from "../controllers/adminController";
import { authenticate, requireAdmin } from "../middleware/auth";
import {
  validateUUID,
  validatePagination,
  handleValidationErrors,
} from "../middleware/validation";

const router = Router();

// All routes require authentication and admin access
router.use(authenticate);
router.use(requireAdmin);

// Dashboard and overview
router.get(
  "/overview",
  handleValidationErrors,
  AdminController.getSystemOverview
);
router.get("/dashboard", handleValidationErrors, AdminController.getDashboard);

// Analytics endpoints
router.get(
  "/analytics/users",
  handleValidationErrors,
  AdminController.getUserAnalytics
);
router.get(
  "/analytics/fleet",
  handleValidationErrors,
  AdminController.getFleetAnalytics
);
router.get(
  "/analytics/safety",
  handleValidationErrors,
  AdminController.getSafetyAnalytics
);
router.get(
  "/analytics/communication",
  handleValidationErrors,
  AdminController.getCommunicationAnalytics
);
router.get(
  "/analytics/performance",
  handleValidationErrors,
  AdminController.getPerformanceMetrics
);

// Reports and exports
router.get(
  "/reports/:reportType",
  handleValidationErrors,
  AdminController.getDetailedReport
);
router.get("/export", handleValidationErrors, AdminController.exportData);

// System management
router.post(
  "/maintenance",
  handleValidationErrors,
  AdminController.runSystemMaintenance
);
router.get(
  "/settings",
  handleValidationErrors,
  AdminController.getSystemSettings
);
router.put(
  "/settings",
  handleValidationErrors,
  AdminController.updateSystemSettings
);

// User management
router.get(
  "/users",
  validatePagination,
  handleValidationErrors,
  AdminController.getAllUsers
);
router.put(
  "/users/:userId",
  validateUUID,
  handleValidationErrors,
  AdminController.updateUser
);
router.put(
  "/users/:userId/deactivate",
  validateUUID,
  handleValidationErrors,
  AdminController.deactivateUser
);
router.put(
  "/users/:userId/reactivate",
  validateUUID,
  handleValidationErrors,
  AdminController.reactivateUser
);

// Fleet management
router.get(
  "/buses",
  validatePagination,
  handleValidationErrors,
  AdminController.getAllBuses
);

// School management
router.get(
  "/schools",
  validatePagination,
  handleValidationErrors,
  AdminController.getAllSchools
);

// Activity and monitoring
router.get(
  "/activities",
  validatePagination,
  handleValidationErrors,
  AdminController.getRecentActivities
);
router.get(
  "/logs",
  validatePagination,
  handleValidationErrors,
  AdminController.getSystemLogs
);

export default router;
