import { Router } from "express";
import { AdminController } from "../controllers/adminController";
import { authenticate, requireAdmin } from "../middleware/auth";
import {
  validateUUID,
  validatePagination,
  validateSchoolCreation,
  validateSchoolUpdate,
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
  "/analytics/students",
  handleValidationErrors,
  AdminController.getStudentAnalytics
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

router.post("/buses", handleValidationErrors, AdminController.createBus);

router.get(
  "/buses/:id",
  validateUUID,
  handleValidationErrors,
  AdminController.getBusById
);

router.put(
  "/buses/:id",
  validateUUID,
  handleValidationErrors,
  AdminController.updateBus
);

router.delete(
  "/buses/:id",
  validateUUID,
  handleValidationErrors,
  AdminController.deleteBus
);

// Bus maintenance
router.get(
  "/buses/maintenance",
  validatePagination,
  handleValidationErrors,
  AdminController.getMaintenanceRecords
);

router.post(
  "/buses/maintenance",
  handleValidationErrors,
  AdminController.createMaintenanceRecord
);

router.put(
  "/buses/maintenance/:id",
  validateUUID,
  handleValidationErrors,
  AdminController.updateMaintenanceRecord
);

router.delete(
  "/buses/maintenance/:id",
  validateUUID,
  handleValidationErrors,
  AdminController.deleteMaintenanceRecord
);

router.get(
  "/buses/:id/maintenance",
  validateUUID,
  handleValidationErrors,
  AdminController.getBusMaintenance
);

router.get(
  "/buses/:id/trips",
  validateUUID,
  handleValidationErrors,
  AdminController.getBusTrips
);

// Bus driver assignments
router.get(
  "/buses/driver-assignments",
  validatePagination,
  handleValidationErrors,
  AdminController.getBusDriverAssignments
);

router.post(
  "/buses/driver-assignments",
  handleValidationErrors,
  AdminController.createBusDriverAssignment
);

router.put(
  "/buses/driver-assignments/:id",
  validateUUID,
  handleValidationErrors,
  AdminController.updateBusDriverAssignment
);

router.delete(
  "/buses/driver-assignments/:id",
  validateUUID,
  handleValidationErrors,
  AdminController.deleteBusDriverAssignment
);

// School management
router.get(
  "/schools",
  validatePagination,
  handleValidationErrors,
  AdminController.getAllSchools
);

router.post(
  "/schools",
  validateSchoolCreation,
  handleValidationErrors,
  AdminController.createSchool
);

router.get(
  "/schools/:id",
  validateUUID,
  handleValidationErrors,
  AdminController.getSchoolById
);

router.put(
  "/schools/:id",
  validateUUID,
  validateSchoolUpdate,
  handleValidationErrors,
  AdminController.updateSchool
);

router.delete(
  "/schools/:id",
  validateUUID,
  handleValidationErrors,
  AdminController.deleteSchool
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
