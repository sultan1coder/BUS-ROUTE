"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const safetyController_1 = require("../controllers/safetyController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
// Emergency alerts and SOS
router.post("/sos", validation_1.validateSOSAlert, validation_1.handleValidationErrors, safetyController_1.SafetyController.triggerSOS);
router.post("/emergency-sms", auth_1.requireSchoolStaff, validation_1.validateEmergencySMS, validation_1.handleValidationErrors, safetyController_1.SafetyController.sendEmergencySMS);
// Geofence management
router.post("/geofences", auth_1.requireSchoolStaff, validation_1.validateGeofence, validation_1.handleValidationErrors, safetyController_1.SafetyController.createGeofence);
router.get("/geofences/bus/:busId", validation_1.validateUUID, validation_1.handleValidationErrors, safetyController_1.SafetyController.getBusGeofences);
router.put("/geofences/:geofenceId", auth_1.requireSchoolStaff, validation_1.validateUUID, validation_1.handleValidationErrors, safetyController_1.SafetyController.updateGeofence);
router.delete("/geofences/:geofenceId", auth_1.requireSchoolStaff, validation_1.validateUUID, validation_1.handleValidationErrors, safetyController_1.SafetyController.deleteGeofence);
// Geofence monitoring
router.post("/geofences/check-violation", validation_1.validateGeofenceCheck, validation_1.handleValidationErrors, safetyController_1.SafetyController.checkGeofenceViolation);
// Speed monitoring
router.post("/speed-violation", validation_1.validateSpeedViolation, validation_1.handleValidationErrors, safetyController_1.SafetyController.reportSpeedViolation);
// Alert management
router.get("/alerts/active", validation_1.validatePagination, validation_1.handleValidationErrors, safetyController_1.SafetyController.getActiveAlerts);
router.get("/alerts/history", validation_1.validatePagination, validation_1.handleValidationErrors, safetyController_1.SafetyController.getAlertHistory);
router.put("/alerts/:alertId/resolve", validation_1.validateUUID, validation_1.validateAlertResolution, validation_1.handleValidationErrors, safetyController_1.SafetyController.resolveAlert);
router.post("/alerts/bulk-resolve", auth_1.requireSchoolStaff, validation_1.handleValidationErrors, safetyController_1.SafetyController.bulkResolveAlerts);
// Safety reports and statistics
router.get("/reports/safety", validation_1.handleValidationErrors, safetyController_1.SafetyController.getSafetyReport);
router.get("/reports/geofence-stats", validation_1.handleValidationErrors, safetyController_1.SafetyController.getGeofenceStats);
router.get("/reports/speed-stats", validation_1.handleValidationErrors, safetyController_1.SafetyController.getSpeedViolationStats);
// Emergency contacts and status
router.get("/emergency-contacts", validation_1.handleValidationErrors, safetyController_1.SafetyController.getEmergencyContacts);
router.get("/status", validation_1.handleValidationErrors, safetyController_1.SafetyController.getSafetyStatus);
// Administrative cleanup
router.delete("/cleanup", auth_1.requireAdmin, validation_1.handleValidationErrors, safetyController_1.SafetyController.cleanupAlerts);
exports.default = router;
//# sourceMappingURL=safety.js.map