"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gpsTrackingController_1 = require("../controllers/gpsTrackingController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
// Record GPS location data (drivers and systems can record)
router.post("/", validation_1.validateGPSData, validation_1.handleValidationErrors, gpsTrackingController_1.GPSTrackingController.recordLocation);
// Bulk location recording (for GPS devices/systems)
router.post("/bulk", auth_1.requireSchoolStaff, // Only authorized systems should bulk update
validation_1.handleValidationErrors, gpsTrackingController_1.GPSTrackingController.bulkRecordLocations);
// Get current location of a specific bus
router.get("/bus/:busId/current", validation_1.validateUUID, validation_1.handleValidationErrors, gpsTrackingController_1.GPSTrackingController.getCurrentLocation);
// Get location history for a bus
router.get("/bus/:busId/history", validation_1.validateUUID, validation_1.validatePagination, validation_1.handleValidationErrors, gpsTrackingController_1.GPSTrackingController.getLocationHistory);
// Get multiple buses' current locations
router.get("/locations", gpsTrackingController_1.GPSTrackingController.getMultipleBusLocations);
// Get real-time dashboard data
router.get("/dashboard", gpsTrackingController_1.GPSTrackingController.getDashboardData);
// Analyze speed patterns for a bus
router.get("/bus/:busId/speed-analysis", validation_1.validateUUID, validation_1.handleValidationErrors, gpsTrackingController_1.GPSTrackingController.analyzeSpeed);
// Check geofence status for a bus
router.get("/bus/:busId/geofence", validation_1.validateUUID, validation_1.handleValidationErrors, gpsTrackingController_1.GPSTrackingController.checkGeofenceStatus);
// Calculate ETA to next stop
router.get("/bus/:busId/eta", validation_1.validateUUID, validation_1.handleValidationErrors, gpsTrackingController_1.GPSTrackingController.calculateETA);
// Get tracking statistics for a bus
router.get("/bus/:busId/stats", validation_1.validateUUID, validation_1.handleValidationErrors, gpsTrackingController_1.GPSTrackingController.getTrackingStats);
// Get bus route for navigation (drivers)
router.get("/bus/:busId/route", validation_1.validateUUID, validation_1.handleValidationErrors, gpsTrackingController_1.GPSTrackingController.getBusRoute);
// Clean up old tracking data (admin only)
router.delete("/cleanup", auth_1.requireSchoolStaff, // Could be restricted to admin
gpsTrackingController_1.GPSTrackingController.cleanupOldData);
exports.default = router;
//# sourceMappingURL=tracking.js.map