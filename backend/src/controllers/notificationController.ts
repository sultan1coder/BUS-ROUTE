import { Response } from "express";
import { AuthenticatedRequest, ApiResponse, PaginatedResponse } from "../types";
import {
  NotificationService,
  NotificationData,
  NotificationPreferences,
} from "../services/notificationService";
import { asyncHandler } from "../middleware/errorHandler";
import prisma from "../config/database";

export class NotificationController {
  // Get user notifications
  static getUserNotifications = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { page = 1, limit = 20, unreadOnly = false } = req.query;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const result = await NotificationService.getUserNotifications(
        userId,
        parseInt(page as string, 10),
        parseInt(limit as string, 10),
        unreadOnly === "true"
      );

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
    }
  );

  // Mark notification as read
  static markAsRead = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const success = await NotificationService.markNotificationAsRead(
        id,
        userId
      );

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
    }
  );

  // Mark all notifications as read
  static markAllAsRead = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const count = await NotificationService.markAllNotificationsAsRead(
        userId
      );

      res.status(200).json({
        success: true,
        message: `${count} notifications marked as read`,
        data: { markedAsRead: count },
      });
    }
  );

  // Get notification preferences
  static getPreferences = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const preferences =
        await NotificationService.getUserNotificationPreferences(userId);

      res.status(200).json({
        success: true,
        data: preferences,
      });
    }
  );

  // Update notification preferences
  static updatePreferences = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse<NotificationPreferences>>
    ): Promise<void> => {
      const userId = req.user?.id;
      const preferencesData = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const preferences =
        await NotificationService.updateNotificationPreferences(
          userId,
          preferencesData
        );

      res.status(200).json({
        success: true,
        message: "Notification preferences updated successfully",
        data: preferences,
      });
    }
  );

  // Send test notification (for development/testing)
  static sendTestNotification = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const userId = req.user?.id;
      const { type, title, message, priority } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const notification = await NotificationService.sendNotification({
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
    }
  );

  // Get notification statistics
  static getNotificationStats = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const [totalNotifications, unreadCount, recentNotifications] =
        await Promise.all([
          prisma.notification.count({
            where: { userId },
          }),
          prisma.notification.count({
            where: { userId, isRead: false },
          }),
          prisma.notification.count({
            where: {
              userId,
              sentAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
              },
            },
          }),
        ]);

      // Get notifications by type
      const notificationsByType = await prisma.notification.groupBy({
        by: ["type"],
        where: { userId },
        _count: true,
      });

      // Get notifications by priority
      const notificationsByPriority = await prisma.notification.groupBy({
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
            readRate:
              totalNotifications > 0
                ? ((totalNotifications - unreadCount) / totalNotifications) *
                  100
                : 0,
          },
          byType: notificationsByType.reduce((acc, item) => {
            acc[item.type] = item._count;
            return acc;
          }, {} as Record<string, number>),
          byPriority: notificationsByPriority.reduce((acc, item) => {
            acc[item.priority] = item._count;
            return acc;
          }, {} as Record<string, number>),
        },
      });
    }
  );

  // Delete old notifications (admin only)
  static cleanupOldNotifications = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { daysToKeep = 30 } = req.query;

      const deletedCount = await NotificationService.cleanupOldNotifications(
        parseInt(daysToKeep as string, 10)
      );

      res.status(200).json({
        success: true,
        message: `Cleaned up ${deletedCount} old notifications`,
        data: { deletedCount },
      });
    }
  );

  // Bulk send notifications (admin/school staff only)
  static bulkSendNotifications = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { notifications, userIds } = req.body;

      if (!Array.isArray(notifications)) {
        res.status(400).json({
          success: false,
          message: "notifications must be an array",
        });
        return;
      }

      const results = await NotificationService.sendBulkNotifications(
        notifications,
        userIds
      );

      const successCount = results.filter((r: any) => r.success).length;
      const failureCount = results.filter((r: any) => !r.success).length;

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
    }
  );

  // Get notifications for a specific bus (school staff)
  static getBusNotifications = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { busId } = req.params;
      const { startDate, endDate, type } = req.query;

      const where: any = {
        data: {
          path: ["busId"],
          equals: busId,
        },
      };

      if (startDate || endDate) {
        where.sentAt = {};
        if (startDate) where.sentAt.gte = new Date(startDate as string);
        if (endDate) where.sentAt.lte = new Date(endDate as string);
      }

      if (type) {
        where.type = type;
      }

      const notifications = await prisma.notification.findMany({
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
    }
  );
}
