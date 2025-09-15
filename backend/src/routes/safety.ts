import { Router } from "express";
import { SafetyController } from "../controllers/safetyController";
import {
  authenticate,
  requireSchoolStaff,
  requireAdmin,
} from "../middleware/auth";
import {
  validateUUID,
  validatePagination,
  validateSOSAlert,
  validateGeofence,
  validateSpeedViolation,
  validateGeofenceCheck,
  validateAlertResolution,
  validateEmergencySMS,
  handleValidationErrors,
} from "../middleware/validation";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Emergency alerts and SOS
router.post(
  "/sos",
  validateSOSAlert,
  handleValidationErrors,
  SafetyController.triggerSOS
);
router.post(
  "/emergency-sms",
  requireSchoolStaff,
  validateEmergencySMS,
  handleValidationErrors,
  SafetyController.sendEmergencySMS
);

// Geofence management
router.post(
  "/geofences",
  requireSchoolStaff,
  validateGeofence,
  handleValidationErrors,
  SafetyController.createGeofence
);
router.get(
  "/geofences/bus/:busId",
  validateUUID,
  handleValidationErrors,
  SafetyController.getBusGeofences
);
router.put(
  "/geofences/:geofenceId",
  requireSchoolStaff,
  validateUUID,
  handleValidationErrors,
  SafetyController.updateGeofence
);
router.delete(
  "/geofences/:geofenceId",
  requireSchoolStaff,
  validateUUID,
  handleValidationErrors,
  SafetyController.deleteGeofence
);

// Geofence monitoring
router.post(
  "/geofences/check-violation",
  validateGeofenceCheck,
  handleValidationErrors,
  SafetyController.checkGeofenceViolation
);

// Speed monitoring
router.post(
  "/speed-violation",
  validateSpeedViolation,
  handleValidationErrors,
  SafetyController.reportSpeedViolation
);

// Alert management
router.get(
  "/alerts/active",
  validatePagination,
  handleValidationErrors,
  SafetyController.getActiveAlerts
);
router.get(
  "/alerts/history",
  validatePagination,
  handleValidationErrors,
  SafetyController.getAlertHistory
);
router.put(
  "/alerts/:alertId/resolve",
  validateUUID,
  validateAlertResolution,
  handleValidationErrors,
  SafetyController.resolveAlert
);
router.post(
  "/alerts/bulk-resolve",
  requireSchoolStaff,
  handleValidationErrors,
  SafetyController.bulkResolveAlerts
);

// Safety reports and statistics
router.get(
  "/reports/safety",
  handleValidationErrors,
  SafetyController.getSafetyReport
);
router.get(
  "/reports/geofence-stats",
  handleValidationErrors,
  SafetyController.getGeofenceStats
);
router.get(
  "/reports/speed-stats",
  handleValidationErrors,
  SafetyController.getSpeedViolationStats
);

// Emergency contacts and status
router.get(
  "/emergency-contacts",
  handleValidationErrors,
  SafetyController.getEmergencyContacts
);
router.get("/status", handleValidationErrors, SafetyController.getSafetyStatus);

// Administrative cleanup
router.delete(
  "/cleanup",
  requireAdmin,
  handleValidationErrors,
  SafetyController.cleanupAlerts
);

export default router;
