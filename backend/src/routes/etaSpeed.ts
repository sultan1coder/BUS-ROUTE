import { Router } from "express";
import { ETASpeedController } from "../controllers/etaSpeedController";
import {
  authenticate,
  requireDriver,
  requireSchoolStaff,
} from "../middleware/auth";
import {
  validateUUID,
  validatePagination,
  handleValidationErrors,
} from "../middleware/validation";

const router = Router();

// All routes require authentication
router.use(authenticate);

// ETA Calculations
router.get(
  "/eta/bus/:busId",
  validateUUID,
  handleValidationErrors,
  ETASpeedController.calculateETA
);

router.get(
  "/eta/analyze/:busId",
  validateUUID,
  handleValidationErrors,
  ETASpeedController.analyzeETA
);

router.get(
  "/eta/predict/:busId",
  validateUUID,
  handleValidationErrors,
  ETASpeedController.predictETA
);

// Speed Monitoring
router.post(
  "/speed/monitor/:busId",
  validateUUID,
  handleValidationErrors,
  ETASpeedController.monitorSpeed
);

router.post(
  "/speed/bulk-monitor",
  requireSchoolStaff, // Only authorized systems should bulk monitor
  handleValidationErrors,
  ETASpeedController.bulkSpeedMonitoring
);

// Speed Analytics
router.get(
  "/speed/analytics/:busId",
  validateUUID,
  handleValidationErrors,
  ETASpeedController.getSpeedAnalytics
);

router.get(
  "/speed/fleet-stats",
  handleValidationErrors,
  ETASpeedController.getFleetSpeedStats
);

// Speed Violations
router.get(
  "/speed/violations/:busId",
  validateUUID,
  validatePagination,
  handleValidationErrors,
  ETASpeedController.getSpeedViolations
);

router.get(
  "/speed/violation-stats",
  handleValidationErrors,
  ETASpeedController.getSpeedViolationStats
);

// ETA Alerts
router.get(
  "/eta/alerts",
  handleValidationErrors,
  ETASpeedController.getETAAllerts
);

export default router;
