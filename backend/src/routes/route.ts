import { Router } from "express";
import { RouteController } from "../controllers/routeController";
import {
  authenticate,
  requireSchoolStaff,
  authorizeSchoolAccess,
} from "../middleware/auth";
import {
  validateRouteCreation,
  validateRouteStopCreation,
  validateRouteUpdate,
  validateRouteStopUpdate,
  validateUUID,
  validateSchoolId,
  validatePagination,
  handleValidationErrors,
} from "../middleware/validation";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create route (school staff and admin only)
router.post(
  "/",
  requireSchoolStaff,
  validateRouteCreation,
  handleValidationErrors,
  RouteController.createRoute
);

// Get all routes with filtering and pagination
router.get(
  "/",
  validatePagination,
  handleValidationErrors,
  RouteController.getRoutes
);

// Get route by ID
router.get(
  "/:id",
  validateUUID,
  handleValidationErrors,
  RouteController.getRouteById
);

// Update route (school staff and admin only)
router.put(
  "/:id",
  requireSchoolStaff,
  validateUUID,
  validateRouteUpdate,
  handleValidationErrors,
  RouteController.updateRoute
);

// Delete route (school staff and admin only)
router.delete(
  "/:id",
  requireSchoolStaff,
  validateUUID,
  handleValidationErrors,
  RouteController.deleteRoute
);

// Get route statistics
router.get(
  "/:id/stats",
  validateUUID,
  handleValidationErrors,
  RouteController.getRouteStats
);

// Get routes by school
router.get(
  "/school/:schoolId",
  validateSchoolId,
  authorizeSchoolAccess,
  handleValidationErrors,
  RouteController.getRoutesBySchool
);

// Route stops management
// Create route stop (school staff and admin only)
router.post(
  "/:id/stops",
  requireSchoolStaff,
  validateUUID,
  validateRouteStopCreation,
  handleValidationErrors,
  RouteController.createRouteStop
);

// Update route stop (school staff and admin only)
router.put(
  "/stops/:stopId",
  requireSchoolStaff,
  validateUUID,
  validateRouteStopUpdate,
  handleValidationErrors,
  RouteController.updateRouteStop
);

// Delete route stop (school staff and admin only)
router.delete(
  "/stops/:stopId",
  requireSchoolStaff,
  validateUUID,
  handleValidationErrors,
  RouteController.deleteRouteStop
);

// Get route stops
router.get(
  "/:id/stops",
  validateUUID,
  handleValidationErrors,
  RouteController.getRouteStops
);

// Reorder route stops (school staff and admin only)
router.put(
  "/:id/reorder-stops",
  requireSchoolStaff,
  validateUUID,
  handleValidationErrors,
  RouteController.reorderRouteStops
);

// Student route assignments
// Assign student to route (school staff and admin only)
router.post(
  "/assign-student",
  requireSchoolStaff,
  handleValidationErrors,
  RouteController.assignStudentToRoute
);

// Unassign student from route (school staff and admin only)
router.delete(
  "/unassign-student/:studentId/:routeId",
  requireSchoolStaff,
  validateUUID,
  handleValidationErrors,
  RouteController.unassignStudentFromRoute
);

// Get student's route assignments
router.get(
  "/student/:studentId/assignments",
  validateUUID,
  handleValidationErrors,
  RouteController.getStudentAssignments
);

// Get route assignments
router.get(
  "/:id/assignments",
  validateUUID,
  handleValidationErrors,
  RouteController.getRouteAssignments
);

export default router;
