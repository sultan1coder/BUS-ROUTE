"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notificationController_1 = require("../controllers/notificationController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
// User notification management
router.get("/", validation_1.validatePagination, validation_1.handleValidationErrors, notificationController_1.NotificationController.getUserNotifications);
router.put("/:id/read", validation_1.validateUUID, validation_1.handleValidationErrors, notificationController_1.NotificationController.markAsRead);
router.put("/mark-all-read", validation_1.handleValidationErrors, notificationController_1.NotificationController.markAllAsRead);
// Notification preferences
router.get("/preferences", validation_1.handleValidationErrors, notificationController_1.NotificationController.getPreferences);
router.put("/preferences", validation_1.handleValidationErrors, notificationController_1.NotificationController.updatePreferences);
// Notification statistics
router.get("/stats", validation_1.handleValidationErrors, notificationController_1.NotificationController.getNotificationStats);
// Test notifications (development only)
router.post("/test", validation_1.handleValidationErrors, notificationController_1.NotificationController.sendTestNotification);
// School staff routes
router.get("/bus/:busId", auth_1.requireSchoolStaff, validation_1.validateUUID, validation_1.handleValidationErrors, notificationController_1.NotificationController.getBusNotifications);
// Admin routes
router.post("/bulk-send", auth_1.requireAdmin, validation_1.handleValidationErrors, notificationController_1.NotificationController.bulkSendNotifications);
router.delete("/cleanup", auth_1.requireAdmin, validation_1.handleValidationErrors, notificationController_1.NotificationController.cleanupOldNotifications);
exports.default = router;
//# sourceMappingURL=notification.js.map