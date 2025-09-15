import { Router } from "express";
import { GPSTrackingController } from "../controllers/gpsTrackingController";
import {
  authenticate,
  requireDriver,
  requireSchoolStaff,
  authorizeSchoolAccess,
} from "../middleware/auth";
import {
  validateGPSData,
  validateUUID,
  validatePagination,
  handleValidationErrors,
} from "../middleware/validation";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Record GPS location data (drivers and systems can record)
router.post(
  "/",
  validateGPSData,
  handleValidationErrors,
  GPSTrackingController.recordLocation
);

// Bulk location recording (for GPS devices/systems)
router.post(
  "/bulk",
  requireSchoolStaff, // Only authorized systems should bulk update
  handleValidationErrors,
  GPSTrackingController.bulkRecordLocations
);

// Get current location of a specific bus
router.get(
  "/bus/:busId/current",
  validateUUID,
  handleValidationErrors,
  GPSTrackingController.getCurrentLocation
);

// Get location history for a bus
router.get(
  "/bus/:busId/history",
  validateUUID,
  validatePagination,
  handleValidationErrors,
  GPSTrackingController.getLocationHistory
);

// Get multiple buses' current locations
router.get("/locations", GPSTrackingController.getMultipleBusLocations);

// Get real-time dashboard data
router.get("/dashboard", GPSTrackingController.getDashboardData);

// Analyze speed patterns for a bus
router.get(
  "/bus/:busId/speed-analysis",
  validateUUID,
  handleValidationErrors,
  GPSTrackingController.analyzeSpeed
);

// Check geofence status for a bus
router.get(
  "/bus/:busId/geofence",
  validateUUID,
  handleValidationErrors,
  GPSTrackingController.checkGeofenceStatus
);

// Calculate ETA to next stop
router.get(
  "/bus/:busId/eta",
  validateUUID,
  handleValidationErrors,
  GPSTrackingController.calculateETA
);

// Get tracking statistics for a bus
router.get(
  "/bus/:busId/stats",
  validateUUID,
  handleValidationErrors,
  GPSTrackingController.getTrackingStats
);

// Get bus route for navigation (drivers)
router.get(
  "/bus/:busId/route",
  validateUUID,
  handleValidationErrors,
  GPSTrackingController.getBusRoute
);

// Clean up old tracking data (admin only)
router.delete(
  "/cleanup",
  requireSchoolStaff, // Could be restricted to admin
  GPSTrackingController.cleanupOldData
);

export default router;
