"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationController = void 0;
const communicationService_1 = require("../services/communicationService");
const errorHandler_1 = require("../middleware/errorHandler");
const database_1 = __importDefault(require("../config/database"));
class CommunicationController {
}
exports.CommunicationController = CommunicationController;
_a = CommunicationController;
// Send a message
CommunicationController.sendMessage = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const senderId = req.user?.id;
    const messageData = req.body;
    if (!senderId) {
        res.status(401).json({
            success: false,
            message: "User not authenticated",
        });
        return;
    }
    // Validate that the sender can communicate with the receiver
    const allowedContacts = await communicationService_1.CommunicationService.getAllowedContacts(senderId);
    const canCommunicate = allowedContacts.some((contact) => contact.id === messageData.receiverId);
    if (!canCommunicate) {
        res.status(403).json({
            success: false,
            message: "You are not allowed to send messages to this user",
        });
        return;
    }
    const message = await communicationService_1.CommunicationService.sendMessage(senderId, messageData);
    res.status(201).json({
        success: true,
        message: "Message sent successfully",
        data: message,
    });
});
// Get conversation with another user
CommunicationController.getConversation = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    const { otherUserId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    if (!userId) {
        res.status(401).json({
            success: false,
            message: "User not authenticated",
            data: [],
            meta: { page: 1, limit: 50, total: 0, totalPages: 0 },
        });
        return;
    }
    // Validate that the user can communicate with the other user
    const allowedContacts = await communicationService_1.CommunicationService.getAllowedContacts(userId);
    const canCommunicate = allowedContacts.some((contact) => contact.id === otherUserId);
    if (!canCommunicate) {
        res.status(403).json({
            success: false,
            message: "You are not allowed to view messages with this user",
            data: [],
            meta: { page: 1, limit: 50, total: 0, totalPages: 0 },
        });
        return;
    }
    const result = await communicationService_1.CommunicationService.getConversation(userId, otherUserId, parseInt(page, 10), parseInt(limit, 10));
    res.status(200).json({
        success: true,
        data: result.messages,
        meta: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
        },
    });
});
// Get all user conversations
CommunicationController.getConversations = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    const { page = 1, limit = 20 } = req.query;
    if (!userId) {
        res.status(401).json({
            success: false,
            message: "User not authenticated",
            data: [],
            meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
        });
        return;
    }
    const result = await communicationService_1.CommunicationService.getUserConversations(userId, parseInt(page, 10), parseInt(limit, 10));
    res.status(200).json({
        success: true,
        data: result.conversations,
        meta: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
        },
    });
});
// Mark messages as read
CommunicationController.markAsRead = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    const { otherUserId } = req.params;
    if (!userId) {
        res.status(401).json({
            success: false,
            message: "User not authenticated",
        });
        return;
    }
    const count = await communicationService_1.CommunicationService.markMessagesAsRead(userId, otherUserId);
    res.status(200).json({
        success: true,
        message: `${count} messages marked as read`,
        data: { markedAsRead: count },
    });
});
// Mark specific message as read
CommunicationController.markMessageAsRead = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    const { messageId } = req.params;
    if (!userId) {
        res.status(401).json({
            success: false,
            message: "User not authenticated",
        });
        return;
    }
    const success = await communicationService_1.CommunicationService.markMessageAsRead(messageId, userId);
    if (!success) {
        res.status(404).json({
            success: false,
            message: "Message not found or access denied",
        });
        return;
    }
    res.status(200).json({
        success: true,
        message: "Message marked as read",
    });
});
// Get allowed contacts
CommunicationController.getContacts = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({
            success: false,
            message: "User not authenticated",
        });
        return;
    }
    const contacts = await communicationService_1.CommunicationService.getAllowedContacts(userId);
    res.status(200).json({
        success: true,
        data: contacts,
    });
});
// Get message statistics
CommunicationController.getMessageStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({
            success: false,
            message: "User not authenticated",
        });
        return;
    }
    const stats = await communicationService_1.CommunicationService.getMessageStats(userId);
    res.status(200).json({
        success: true,
        data: stats,
    });
});
// Send bulk messages (admin/school staff only)
CommunicationController.sendBulkMessages = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const senderId = req.user?.id;
    const bulkData = req.body;
    if (!senderId) {
        res.status(401).json({
            success: false,
            message: "User not authenticated",
        });
        return;
    }
    // Validate user role (only school staff and admin can send bulk messages)
    const user = await database_1.default.user.findUnique({
        where: { id: senderId },
        select: { role: true },
    });
    if (!user || !["SCHOOL_STAFF", "ADMIN"].includes(user.role)) {
        res.status(403).json({
            success: false,
            message: "Only school staff and administrators can send bulk messages",
        });
        return;
    }
    const results = await communicationService_1.CommunicationService.sendBulkMessages(senderId, bulkData);
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;
    res.status(200).json({
        success: true,
        message: `Bulk messaging completed: ${successCount} successful, ${failureCount} failed`,
        data: {
            total: bulkData.receiverIds.length,
            successful: successCount,
            failed: failureCount,
            results,
        },
    });
});
// Delete a message
CommunicationController.deleteMessage = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    const { messageId } = req.params;
    if (!userId) {
        res.status(401).json({
            success: false,
            message: "User not authenticated",
        });
        return;
    }
    const success = await communicationService_1.CommunicationService.deleteMessage(messageId, userId);
    if (!success) {
        res.status(404).json({
            success: false,
            message: "Message not found or access denied",
        });
        return;
    }
    res.status(200).json({
        success: true,
        message: "Message deleted successfully",
    });
});
// Search messages
CommunicationController.searchMessages = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    const { query } = req.query;
    const { page = 1, limit = 20 } = req.query;
    if (!userId) {
        res.status(401).json({
            success: false,
            message: "User not authenticated",
            data: [],
            meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
        });
        return;
    }
    if (!query || typeof query !== "string" || query.trim().length < 2) {
        res.status(400).json({
            success: false,
            message: "Search query must be at least 2 characters long",
            data: [],
            meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
        });
        return;
    }
    const result = await communicationService_1.CommunicationService.searchMessages(userId, query.trim(), parseInt(page, 10), parseInt(limit, 10));
    res.status(200).json({
        success: true,
        data: result.messages,
        meta: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
        },
    });
});
// Get emergency contacts for quick messaging
CommunicationController.getEmergencyContacts = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({
            success: false,
            message: "User not authenticated",
        });
        return;
    }
    // Get school staff and admin contacts for emergency messaging
    const emergencyContacts = await database_1.default.user.findMany({
        where: {
            role: { in: ["SCHOOL_STAFF", "ADMIN"] },
            isActive: true,
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            avatar: true,
            schoolStaff: {
                select: {
                    school: {
                        select: {
                            name: true,
                        },
                    },
                },
            },
        },
        orderBy: { role: "asc" },
    });
    const formattedContacts = emergencyContacts.map((contact) => ({
        id: contact.id,
        name: `${contact.firstName} ${contact.lastName}`,
        role: contact.role,
        avatar: contact.avatar,
        school: contact.schoolStaff?.school?.name,
        contactType: "emergency",
    }));
    res.status(200).json({
        success: true,
        data: formattedContacts,
    });
});
// Send emergency message (creates both message and notification)
CommunicationController.sendEmergencyMessage = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const senderId = req.user?.id;
    const { receiverId, content } = req.body;
    if (!senderId) {
        res.status(401).json({
            success: false,
            message: "User not authenticated",
        });
        return;
    }
    // Send emergency message
    const message = await communicationService_1.CommunicationService.sendMessage(senderId, {
        receiverId,
        type: "EMERGENCY",
        content,
    });
    res.status(201).json({
        success: true,
        message: "Emergency message sent successfully",
        data: message,
    });
});
// Get unread message count
CommunicationController.getUnreadCount = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({
            success: false,
            message: "User not authenticated",
        });
        return;
    }
    const unreadCount = await database_1.default.message.count({
        where: {
            receiverId: userId,
            isRead: false,
        },
    });
    res.status(200).json({
        success: true,
        data: { unreadCount },
    });
});
// Clean up old messages (admin only)
CommunicationController.cleanupMessages = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { daysToKeep = 90 } = req.query;
    const deletedCount = await communicationService_1.CommunicationService.cleanupOldMessages(parseInt(daysToKeep, 10));
    res.status(200).json({
        success: true,
        message: `Cleaned up ${deletedCount} old messages`,
        data: { deletedCount },
    });
});
//# sourceMappingURL=communicationController.js.map