"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const driverAppController_1 = require("../controllers/driverAppController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// All routes require driver-only authentication
router.use(auth_1.requireDriverOnly);
// Dashboard and overview
router.get("/dashboard", validation_1.handleValidationErrors, driverAppController_1.DriverAppController.getDashboard);
router.get("/settings", validation_1.handleValidationErrors, driverAppController_1.DriverAppController.getDriverSettings);
router.put("/settings", validation_1.handleValidationErrors, driverAppController_1.DriverAppController.updateDriverSettings);
// Trip management
router.post("/trips/start", validation_1.validateTripStart, validation_1.handleValidationErrors, driverAppController_1.DriverAppController.startTrip);
router.put("/trips/:tripId", validation_1.validateUUID, validation_1.validateTripUpdate, validation_1.handleValidationErrors, driverAppController_1.DriverAppController.updateTrip);
router.get("/trips/current", validation_1.handleValidationErrors, driverAppController_1.DriverAppController.getCurrentTrip);
router.get("/trips/history", validation_1.validatePagination, validation_1.handleValidationErrors, driverAppController_1.DriverAppController.getTripHistory);
router.get("/trips/:tripId/summary", validation_1.validateUUID, validation_1.handleValidationErrors, driverAppController_1.DriverAppController.getTripSummary);
// Navigation and routes
router.get("/routes", validation_1.handleValidationErrors, driverAppController_1.DriverAppController.getRoutes);
router.get("/routes/:routeId", validation_1.validateUUID, validation_1.handleValidationErrors, driverAppController_1.DriverAppController.getRouteDetails);
router.post("/navigation", validation_1.validateNavigationRequest, validation_1.handleValidationErrors, driverAppController_1.DriverAppController.getTripNavigation);
// Student management
router.post("/trips/:tripId/pickup", validation_1.validateUUID, validation_1.validateStudentPickup, validation_1.handleValidationErrors, driverAppController_1.DriverAppController.recordStudentPickup);
router.post("/trips/:tripId/drop", validation_1.validateUUID, validation_1.validateStudentDrop, validation_1.handleValidationErrors, driverAppController_1.DriverAppController.recordStudentDrop);
router.get("/trips/:tripId/manifest", validation_1.validateUUID, validation_1.handleValidationErrors, driverAppController_1.DriverAppController.getStudentManifest);
router.get("/trips/:tripId/students/:studentId/attendance", validation_1.validateUUID, validation_1.handleValidationErrors, driverAppController_1.DriverAppController.quickAttendanceCheck);
// Stops management
router.get("/stops/:stopId", validation_1.validateUUID, validation_1.handleValidationErrors, driverAppController_1.DriverAppController.getStopDetails);
// Location and tracking
router.post("/location", validation_1.validateLocationUpdate, validation_1.handleValidationErrors, driverAppController_1.DriverAppController.updateLocation);
router.put("/status", validation_1.validateDriverStatusUpdate, validation_1.handleValidationErrors, driverAppController_1.DriverAppController.updateDriverStatus);
// Emergency features
router.post("/emergency", validation_1.validateDriverEmergency, validation_1.handleValidationErrors, driverAppController_1.DriverAppController.triggerEmergency);
// Notifications
router.get("/notifications", validation_1.validatePagination, validation_1.handleValidationErrors, driverAppController_1.DriverAppController.getNotifications);
router.put("/notifications/:notificationId/read", validation_1.validateUUID, validation_1.handleValidationErrors, driverAppController_1.DriverAppController.markNotificationRead);
// Reports and analytics
router.get("/reports", validation_1.handleValidationErrors, driverAppController_1.DriverAppController.getReport);
exports.default = router;
//# sourceMappingURL=driverApp.js.map