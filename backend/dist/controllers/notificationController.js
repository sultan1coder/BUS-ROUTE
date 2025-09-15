"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notificationService_1 = require("../services/notificationService");
const errorHandler_1 = require("../middleware/errorHandler");
const database_1 = __importDefault(require("../config/database"));
class NotificationController {
}
exports.NotificationController = NotificationController;
_a = NotificationController;
// Get user notifications
NotificationController.getUserNotifications = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({
            success: false,
            message: "User not authenticated",
        });
        return;
    }
    const result = await notificationService_1.NotificationService.getUserNotifications(userId, parseInt(page, 10), parseInt(limit, 10), unreadOnly === "true");
    res.status(200).json({
        success: true,
        data: {
            notifications: result.notifications,
            meta: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
                unreadCount: result.unreadCount,
            },
        },
    });
});
// Mark notification as read
NotificationController.markAsRead = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({
            success: false,
            message: "User not authenticated",
        });
        return;
    }
    const success = await notificationService_1.NotificationService.markNotificationAsRead(id, userId);
    if (!success) {
        res.status(404).json({
            success: false,
            message: "Notification not found or access denied",
        });
        return;
    }
    res.status(200).json({
        success: true,
        message: "Notification marked as read",
    });
});
// Mark all notifications as read
NotificationController.markAllAsRead = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({
            success: false,
            message: "User not authenticated",
        });
        return;
    }
    const count = await notificationService_1.NotificationService.markAllNotificationsAsRead(userId);
    res.status(200).json({
        success: true,
        message: `${count} notifications marked as read`,
        data: { markedAsRead: count },
    });
});
// Get notification preferences
NotificationController.getPreferences = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({
            success: false,
            message: "User not authenticated",
        });
        return;
    }
    const preferences = await notificationService_1.NotificationService.getUserNotificationPreferences(userId);
    res.status(200).json({
        success: true,
        data: preferences,
    });
});
// Update notification preferences
NotificationController.updatePreferences = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    const preferencesData = req.body;
    if (!userId) {
        res.status(401).json({
            success: false,
            message: "User not authenticated",
        });
        return;
    }
    const preferences = await notificationService_1.NotificationService.updateNotificationPreferences(userId, preferencesData);
    res.status(200).json({
        success: true,
        message: "Notification preferences updated successfully",
        data: preferences,
    });
});
// Send test notification (for development/testing)
NotificationController.sendTestNotification = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    const { type, title, message, priority } = req.body;
    if (!userId) {
        res.status(401).json({
            success: false,
            message: "User not authenticated",
        });
        return;
    }
    const notification = await notificationService_1.NotificationService.sendNotification({
        type: type || "GENERAL",
        title: title || "Test Notification",
        message: message || "This is a test notification",
        recipientId: userId,
        priority: priority || "low",
        data: { test: true, timestamp: new Date() },
    });
    res.status(200).json({
        success: true,
        message: "Test notification sent successfully",
        data: notification,
    });
});
// Get notification statistics
NotificationController.getNotificationStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({
            success: false,
            message: "User not authenticated",
        });
        return;
    }
    const [totalNotifications, unreadCount, recentNotifications] = await Promise.all([
        database_1.default.notification.count({
            where: { userId },
        }),
        database_1.default.notification.count({
            where: { userId, isRead: false },
        }),
        database_1.default.notification.count({
            where: {
                userId,
                sentAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
                },
            },
        }),
    ]);
    // Get notifications by type
    const notificationsByType = await database_1.default.notification.groupBy({
        by: ["type"],
        where: { userId },
        _count: true,
    });
    // Get notifications by priority
    const notificationsByPriority = await database_1.default.notification.groupBy({
        by: ["priority"],
        where: { userId },
        _count: true,
    });
    res.status(200).json({
        success: true,
        data: {
            summary: {
                total: totalNotifications,
                unread: unreadCount,
                recent: recentNotifications, // Last 7 days
                readRate: totalNotifications > 0
                    ? ((totalNotifications - unreadCount) / totalNotifications) *
                        100
                    : 0,
            },
            byType: notificationsByType.reduce((acc, item) => {
                acc[item.type] = item._count;
                return acc;
            }, {}),
            byPriority: notificationsByPriority.reduce((acc, item) => {
                acc[item.priority] = item._count;
                return acc;
            }, {}),
        },
    });
});
// Delete old notifications (admin only)
NotificationController.cleanupOldNotifications = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { daysToKeep = 30 } = req.query;
    const deletedCount = await notificationService_1.NotificationService.cleanupOldNotifications(parseInt(daysToKeep, 10));
    res.status(200).json({
        success: true,
        message: `Cleaned up ${deletedCount} old notifications`,
        data: { deletedCount },
    });
});
// Bulk send notifications (admin/school staff only)
NotificationController.bulkSendNotifications = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { notifications, userIds } = req.body;
    if (!Array.isArray(notifications)) {
        res.status(400).json({
            success: false,
            message: "notifications must be an array",
        });
        return;
    }
    const results = await notificationService_1.NotificationService.sendBulkNotifications(notifications, userIds);
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;
    res.status(200).json({
        success: true,
        message: `Bulk notification sending completed: ${successCount} successful, ${failureCount} failed`,
        data: {
            total: results.length,
            successful: successCount,
            failed: failureCount,
            results,
        },
    });
});
// Get notifications for a specific bus (school staff)
NotificationController.getBusNotifications = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { busId } = req.params;
    const { startDate, endDate, type } = req.query;
    const where = {
        data: {
            path: ["busId"],
            equals: busId,
        },
    };
    if (startDate || endDate) {
        where.sentAt = {};
        if (startDate)
            where.sentAt.gte = new Date(startDate);
        if (endDate)
            where.sentAt.lte = new Date(endDate);
    }
    if (type) {
        where.type = type;
    }
    const notifications = await database_1.default.notification.findMany({
        where,
        orderBy: { sentAt: "desc" },
        take: 100, // Limit to prevent large responses
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                },
            },
        },
    });
    res.status(200).json({
        success: true,
        data: notifications,
    });
});
//# sourceMappingURL=notificationController.js.map