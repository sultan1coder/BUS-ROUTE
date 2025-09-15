"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const etaSpeedController_1 = require("../controllers/etaSpeedController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
// ETA Calculations
router.get("/eta/bus/:busId", validation_1.validateUUID, validation_1.handleValidationErrors, etaSpeedController_1.ETASpeedController.calculateETA);
router.get("/eta/analyze/:busId", validation_1.validateUUID, validation_1.handleValidationErrors, etaSpeedController_1.ETASpeedController.analyzeETA);
router.get("/eta/predict/:busId", validation_1.validateUUID, validation_1.handleValidationErrors, etaSpeedController_1.ETASpeedController.predictETA);
// Speed Monitoring
router.post("/speed/monitor/:busId", validation_1.validateUUID, validation_1.handleValidationErrors, etaSpeedController_1.ETASpeedController.monitorSpeed);
router.post("/speed/bulk-monitor", auth_1.requireSchoolStaff, // Only authorized systems should bulk monitor
validation_1.handleValidationErrors, etaSpeedController_1.ETASpeedController.bulkSpeedMonitoring);
// Speed Analytics
router.get("/speed/analytics/:busId", validation_1.validateUUID, validation_1.handleValidationErrors, etaSpeedController_1.ETASpeedController.getSpeedAnalytics);
router.get("/speed/fleet-stats", validation_1.handleValidationErrors, etaSpeedController_1.ETASpeedController.getFleetSpeedStats);
// Speed Violations
router.get("/speed/violations/:busId", validation_1.validateUUID, validation_1.validatePagination, validation_1.handleValidationErrors, etaSpeedController_1.ETASpeedController.getSpeedViolations);
router.get("/speed/violation-stats", validation_1.handleValidationErrors, etaSpeedController_1.ETASpeedController.getSpeedViolationStats);
// ETA Alerts
router.get("/eta/alerts", validation_1.handleValidationErrors, etaSpeedController_1.ETASpeedController.getETAAllerts);
exports.default = router;
//# sourceMappingURL=etaSpeed.js.map