import { Router } from "express";
import { CommunicationController } from "../controllers/communicationController";
import {
  authenticate,
  requireSchoolStaff,
  requireAdmin,
} from "../middleware/auth";
import {
  validateUUID,
  validatePagination,
  validateSendMessage,
  validateBulkMessage,
  validateSearchMessages,
  handleValidationErrors,
} from "../middleware/validation";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Message CRUD operations
router.post(
  "/",
  validateSendMessage,
  handleValidationErrors,
  CommunicationController.sendMessage
);

router.get(
  "/conversations",
  validatePagination,
  handleValidationErrors,
  CommunicationController.getConversations
);

router.get(
  "/conversation/:otherUserId",
  validateUUID,
  validatePagination,
  handleValidationErrors,
  CommunicationController.getConversation
);

// Message management
router.put(
  "/conversation/:otherUserId/read",
  validateUUID,
  handleValidationErrors,
  CommunicationController.markAsRead
);

router.put(
  "/message/:messageId/read",
  validateUUID,
  handleValidationErrors,
  CommunicationController.markMessageAsRead
);

router.delete(
  "/message/:messageId",
  validateUUID,
  handleValidationErrors,
  CommunicationController.deleteMessage
);

// Search and utilities
router.get(
  "/search",
  validateSearchMessages,
  validatePagination,
  handleValidationErrors,
  CommunicationController.searchMessages
);

router.get(
  "/contacts",
  handleValidationErrors,
  CommunicationController.getContacts
);

router.get(
  "/emergency-contacts",
  handleValidationErrors,
  CommunicationController.getEmergencyContacts
);

// Statistics
router.get(
  "/stats",
  handleValidationErrors,
  CommunicationController.getMessageStats
);

router.get(
  "/unread-count",
  handleValidationErrors,
  CommunicationController.getUnreadCount
);

// Emergency messaging
router.post(
  "/emergency",
  handleValidationErrors,
  CommunicationController.sendEmergencyMessage
);

// Bulk messaging (school staff/admin only)
router.post(
  "/bulk",
  requireSchoolStaff,
  validateBulkMessage,
  handleValidationErrors,
  CommunicationController.sendBulkMessages
);

// Cleanup (admin only)
router.delete(
  "/cleanup",
  requireAdmin,
  handleValidationErrors,
  CommunicationController.cleanupMessages
);

export default router;
