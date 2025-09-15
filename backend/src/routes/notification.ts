import { Router } from "express";
import { NotificationController } from "../controllers/notificationController";
import {
  authenticate,
  requireSchoolStaff,
  requireAdmin,
} from "../middleware/auth";
import {
  validateUUID,
  validatePagination,
  handleValidationErrors,
} from "../middleware/validation";

const router = Router();

// All routes require authentication
router.use(authenticate);

// User notification management
router.get(
  "/",
  validatePagination,
  handleValidationErrors,
  NotificationController.getUserNotifications
);

router.put(
  "/:id/read",
  validateUUID,
  handleValidationErrors,
  NotificationController.markAsRead
);

router.put(
  "/mark-all-read",
  handleValidationErrors,
  NotificationController.markAllAsRead
);

// Notification preferences
router.get(
  "/preferences",
  handleValidationErrors,
  NotificationController.getPreferences
);

router.put(
  "/preferences",
  handleValidationErrors,
  NotificationController.updatePreferences
);

// Notification statistics
router.get(
  "/stats",
  handleValidationErrors,
  NotificationController.getNotificationStats
);

// Test notifications (development only)
router.post(
  "/test",
  handleValidationErrors,
  NotificationController.sendTestNotification
);

// School staff routes
router.get(
  "/bus/:busId",
  requireSchoolStaff,
  validateUUID,
  handleValidationErrors,
  NotificationController.getBusNotifications
);

// Admin routes
router.post(
  "/bulk-send",
  requireAdmin,
  handleValidationErrors,
  NotificationController.bulkSendNotifications
);

router.delete(
  "/cleanup",
  requireAdmin,
  handleValidationErrors,
  NotificationController.cleanupOldNotifications
);

export default router;
