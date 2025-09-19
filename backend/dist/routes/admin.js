"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// All routes require authentication and admin access
router.use(auth_1.authenticate);
router.use(auth_1.requireAdmin);
// Dashboard and overview
router.get("/overview", validation_1.handleValidationErrors, adminController_1.AdminController.getSystemOverview);
router.get("/dashboard", validation_1.handleValidationErrors, adminController_1.AdminController.getDashboard);
// Analytics endpoints
router.get("/analytics/users", validation_1.handleValidationErrors, adminController_1.AdminController.getUserAnalytics);
router.get("/analytics/fleet", validation_1.handleValidationErrors, adminController_1.AdminController.getFleetAnalytics);
router.get("/analytics/safety", validation_1.handleValidationErrors, adminController_1.AdminController.getSafetyAnalytics);
router.get("/analytics/communication", validation_1.handleValidationErrors, adminController_1.AdminController.getCommunicationAnalytics);
router.get("/analytics/performance", validation_1.handleValidationErrors, adminController_1.AdminController.getPerformanceMetrics);
// Reports and exports
router.get("/reports/:reportType", validation_1.handleValidationErrors, adminController_1.AdminController.getDetailedReport);
router.get("/export", validation_1.handleValidationErrors, adminController_1.AdminController.exportData);
// System management
router.post("/maintenance", validation_1.handleValidationErrors, adminController_1.AdminController.runSystemMaintenance);
router.get("/settings", validation_1.handleValidationErrors, adminController_1.AdminController.getSystemSettings);
router.put("/settings", validation_1.handleValidationErrors, adminController_1.AdminController.updateSystemSettings);
// User management
router.get("/users", validation_1.validatePagination, validation_1.handleValidationErrors, adminController_1.AdminController.getAllUsers);
router.put("/users/:userId", validation_1.validateUUID, validation_1.handleValidationErrors, adminController_1.AdminController.updateUser);
router.put("/users/:userId/deactivate", validation_1.validateUUID, validation_1.handleValidationErrors, adminController_1.AdminController.deactivateUser);
router.put("/users/:userId/reactivate", validation_1.validateUUID, validation_1.handleValidationErrors, adminController_1.AdminController.reactivateUser);
// Fleet management
router.get("/buses", validation_1.validatePagination, validation_1.handleValidationErrors, adminController_1.AdminController.getAllBuses);
// School management
router.get("/schools", validation_1.validatePagination, validation_1.handleValidationErrors, adminController_1.AdminController.getAllSchools);
// Activity and monitoring
router.get("/activities", validation_1.validatePagination, validation_1.handleValidationErrors, adminController_1.AdminController.getRecentActivities);
router.get("/logs", validation_1.validatePagination, validation_1.handleValidationErrors, adminController_1.AdminController.getSystemLogs);
exports.default = router;
//# sourceMappingURL=admin.js.map