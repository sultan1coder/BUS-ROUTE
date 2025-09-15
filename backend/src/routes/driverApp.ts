import { Router } from "express";
import { DriverAppController } from "../controllers/driverAppController";
import { requireDriverOnly } from "../middleware/auth";
import {
  validateUUID,
  validatePagination,
  validateTripStart,
  validateTripUpdate,
  validateStudentPickup,
  validateStudentDrop,
  validateLocationUpdate,
  validateNavigationRequest,
  validateDriverEmergency,
  validateDriverStatusUpdate,
  handleValidationErrors,
} from "../middleware/validation";

const router = Router();

// All routes require driver-only authentication
router.use(requireDriverOnly);

// Dashboard and overview
router.get(
  "/dashboard",
  handleValidationErrors,
  DriverAppController.getDashboard
);
router.get(
  "/settings",
  handleValidationErrors,
  DriverAppController.getDriverSettings
);
router.put(
  "/settings",
  handleValidationErrors,
  DriverAppController.updateDriverSettings
);

// Trip management
router.post(
  "/trips/start",
  validateTripStart,
  handleValidationErrors,
  DriverAppController.startTrip
);
router.put(
  "/trips/:tripId",
  validateUUID,
  validateTripUpdate,
  handleValidationErrors,
  DriverAppController.updateTrip
);
router.get(
  "/trips/current",
  handleValidationErrors,
  DriverAppController.getCurrentTrip
);
router.get(
  "/trips/history",
  validatePagination,
  handleValidationErrors,
  DriverAppController.getTripHistory
);
router.get(
  "/trips/:tripId/summary",
  validateUUID,
  handleValidationErrors,
  DriverAppController.getTripSummary
);

// Navigation and routes
router.get("/routes", handleValidationErrors, DriverAppController.getRoutes);
router.get(
  "/routes/:routeId",
  validateUUID,
  handleValidationErrors,
  DriverAppController.getRouteDetails
);
router.post(
  "/navigation",
  validateNavigationRequest,
  handleValidationErrors,
  DriverAppController.getTripNavigation
);

// Student management
router.post(
  "/trips/:tripId/pickup",
  validateUUID,
  validateStudentPickup,
  handleValidationErrors,
  DriverAppController.recordStudentPickup
);
router.post(
  "/trips/:tripId/drop",
  validateUUID,
  validateStudentDrop,
  handleValidationErrors,
  DriverAppController.recordStudentDrop
);
router.get(
  "/trips/:tripId/manifest",
  validateUUID,
  handleValidationErrors,
  DriverAppController.getStudentManifest
);
router.get(
  "/trips/:tripId/students/:studentId/attendance",
  validateUUID,
  handleValidationErrors,
  DriverAppController.quickAttendanceCheck
);

// Stops management
router.get(
  "/stops/:stopId",
  validateUUID,
  handleValidationErrors,
  DriverAppController.getStopDetails
);

// Location and tracking
router.post(
  "/location",
  validateLocationUpdate,
  handleValidationErrors,
  DriverAppController.updateLocation
);
router.put(
  "/status",
  validateDriverStatusUpdate,
  handleValidationErrors,
  DriverAppController.updateDriverStatus
);

// Emergency features
router.post(
  "/emergency",
  validateDriverEmergency,
  handleValidationErrors,
  DriverAppController.triggerEmergency
);

// Notifications
router.get(
  "/notifications",
  validatePagination,
  handleValidationErrors,
  DriverAppController.getNotifications
);
router.put(
  "/notifications/:notificationId/read",
  validateUUID,
  handleValidationErrors,
  DriverAppController.markNotificationRead
);

// Reports and analytics
router.get("/reports", handleValidationErrors, DriverAppController.getReport);

export default router;
