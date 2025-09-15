import { Router } from "express";
import { BusController } from "../controllers/busController";
import {
  authenticate,
  requireSchoolStaff,
  authorizeSchoolAccess,
} from "../middleware/auth";
import {
  validateBusCreation,
  validateBusUpdate,
  validateUUID,
  validateSchoolId,
  validatePagination,
  handleValidationErrors,
} from "../middleware/validation";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create bus (school staff and admin only)
router.post(
  "/",
  requireSchoolStaff,
  validateBusCreation,
  handleValidationErrors,
  BusController.createBus
);

// Get all buses with filtering and pagination
router.get(
  "/",
  validatePagination,
  handleValidationErrors,
  BusController.getBuses
);

// Get bus by ID
router.get(
  "/:id",
  validateUUID,
  handleValidationErrors,
  BusController.getBusById
);

// Update bus (school staff and admin only)
router.put(
  "/:id",
  requireSchoolStaff,
  validateUUID,
  validateBusUpdate,
  handleValidationErrors,
  BusController.updateBus
);

// Delete bus (school staff and admin only)
router.delete(
  "/:id",
  requireSchoolStaff,
  validateUUID,
  handleValidationErrors,
  BusController.deleteBus
);

// Assign driver to bus (school staff and admin only)
router.post(
  "/:id/assign-driver",
  requireSchoolStaff,
  validateUUID,
  handleValidationErrors,
  BusController.assignDriver
);

// Unassign driver from bus (school staff and admin only)
router.post(
  "/:id/unassign-driver",
  requireSchoolStaff,
  validateUUID,
  handleValidationErrors,
  BusController.unassignDriver
);

// Get bus statistics
router.get(
  "/:id/stats",
  validateUUID,
  handleValidationErrors,
  BusController.getBusStats
);

// Get buses by school
router.get(
  "/school/:schoolId",
  validateSchoolId,
  authorizeSchoolAccess,
  handleValidationErrors,
  BusController.getBusesBySchool
);

export default router;
