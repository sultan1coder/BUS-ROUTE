"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const communicationController_1 = require("../controllers/communicationController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
// Message CRUD operations
router.post("/", validation_1.validateSendMessage, validation_1.handleValidationErrors, communicationController_1.CommunicationController.sendMessage);
router.get("/conversations", validation_1.validatePagination, validation_1.handleValidationErrors, communicationController_1.CommunicationController.getConversations);
router.get("/conversation/:otherUserId", validation_1.validateUUID, validation_1.validatePagination, validation_1.handleValidationErrors, communicationController_1.CommunicationController.getConversation);
// Message management
router.put("/conversation/:otherUserId/read", validation_1.validateUUID, validation_1.handleValidationErrors, communicationController_1.CommunicationController.markAsRead);
router.put("/message/:messageId/read", validation_1.validateUUID, validation_1.handleValidationErrors, communicationController_1.CommunicationController.markMessageAsRead);
router.delete("/message/:messageId", validation_1.validateUUID, validation_1.handleValidationErrors, communicationController_1.CommunicationController.deleteMessage);
// Search and utilities
router.get("/search", validation_1.validateSearchMessages, validation_1.validatePagination, validation_1.handleValidationErrors, communicationController_1.CommunicationController.searchMessages);
router.get("/contacts", validation_1.handleValidationErrors, communicationController_1.CommunicationController.getContacts);
router.get("/emergency-contacts", validation_1.handleValidationErrors, communicationController_1.CommunicationController.getEmergencyContacts);
// Statistics
router.get("/stats", validation_1.handleValidationErrors, communicationController_1.CommunicationController.getMessageStats);
router.get("/unread-count", validation_1.handleValidationErrors, communicationController_1.CommunicationController.getUnreadCount);
// Emergency messaging
router.post("/emergency", validation_1.handleValidationErrors, communicationController_1.CommunicationController.sendEmergencyMessage);
// Bulk messaging (school staff/admin only)
router.post("/bulk", auth_1.requireSchoolStaff, validation_1.validateBulkMessage, validation_1.handleValidationErrors, communicationController_1.CommunicationController.sendBulkMessages);
// Cleanup (admin only)
router.delete("/cleanup", auth_1.requireAdmin, validation_1.handleValidationErrors, communicationController_1.CommunicationController.cleanupMessages);
exports.default = router;
//# sourceMappingURL=communication.js.map