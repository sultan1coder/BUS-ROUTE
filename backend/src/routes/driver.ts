import { Router } from "express";
import { DriverController } from "../controllers/driverController";
import {
  authenticate,
  requireSchoolStaff,
  requireDriver,
  authorize,
} from "../middleware/auth";
import { UserRole } from "../types";
import {
  validateDriverCreation,
  validateDriverUpdate,
  validateUUID,
  validatePagination,
  handleValidationErrors,
} from "../middleware/validation";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create driver profile (admin and school staff only)
router.post(
  "/",
  requireSchoolStaff,
  validateDriverCreation,
  handleValidationErrors,
  DriverController.createDriver
);

// Get all drivers with filtering and pagination
router.get(
  "/",
  validatePagination,
  handleValidationErrors,
  DriverController.getDrivers
);

// Get driver by ID
router.get(
  "/:id",
  validateUUID,
  handleValidationErrors,
  DriverController.getDriverById
);

// Get current driver's profile (for drivers)
router.get("/profile/me", requireDriver, DriverController.getMyProfile);

// Update driver (admin and school staff only)
router.put(
  "/:id",
  requireSchoolStaff,
  validateUUID,
  validateDriverUpdate,
  handleValidationErrors,
  DriverController.updateDriver
);

// Update current driver's profile (for drivers)
router.put(
  "/profile/me",
  requireDriver,
  validateDriverUpdate,
  handleValidationErrors,
  DriverController.updateMyProfile
);

// Delete driver (admin and school staff only)
router.delete(
  "/:id",
  requireSchoolStaff,
  validateUUID,
  handleValidationErrors,
  DriverController.deleteDriver
);

// Assign driver to bus (admin and school staff only)
router.post(
  "/:id/assign-bus",
  requireSchoolStaff,
  validateUUID,
  handleValidationErrors,
  DriverController.assignToBus
);

// Unassign driver from bus (admin and school staff only)
router.post(
  "/:id/unassign-bus",
  requireSchoolStaff,
  validateUUID,
  handleValidationErrors,
  DriverController.unassignFromBus
);

// Get driver statistics
router.get(
  "/:id/stats",
  validateUUID,
  handleValidationErrors,
  DriverController.getDriverStats
);

// Get current driver's statistics (for drivers)
router.get("/stats/me", requireDriver, DriverController.getMyStats);

// Get available drivers (not assigned to any bus)
router.get("/available", DriverController.getAvailableDrivers);

// Get drivers with expiring licenses (admin and school staff only)
router.get(
  "/expiring-licenses",
  requireSchoolStaff,
  DriverController.getDriversWithExpiringLicenses
);

export default router;
