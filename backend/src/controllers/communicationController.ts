import { Response } from "express";
import { AuthenticatedRequest, ApiResponse, PaginatedResponse } from "../types";
import {
  CommunicationService,
  SendMessageData,
  BulkMessageData,
} from "../services/communicationService";
import { asyncHandler } from "../middleware/errorHandler";
import prisma from "../config/database";

export class CommunicationController {
  // Send a message
  static sendMessage = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const senderId = req.user?.id;
      const messageData: SendMessageData = req.body;

      if (!senderId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      // Validate that the sender can communicate with the receiver
      const allowedContacts = await CommunicationService.getAllowedContacts(
        senderId
      );
      const canCommunicate = allowedContacts.some(
        (contact) => contact.id === messageData.receiverId
      );

      if (!canCommunicate) {
        res.status(403).json({
          success: false,
          message: "You are not allowed to send messages to this user",
        });
        return;
      }

      const message = await CommunicationService.sendMessage(
        senderId,
        messageData
      );

      res.status(201).json({
        success: true,
        message: "Message sent successfully",
        data: message,
      });
    }
  );

  // Get conversation with another user
  static getConversation = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<PaginatedResponse<any>>
    ): Promise<void> => {
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
      const allowedContacts = await CommunicationService.getAllowedContacts(
        userId
      );
      const canCommunicate = allowedContacts.some(
        (contact) => contact.id === otherUserId
      );

      if (!canCommunicate) {
        res.status(403).json({
          success: false,
          message: "You are not allowed to view messages with this user",
          data: [],
          meta: { page: 1, limit: 50, total: 0, totalPages: 0 },
        });
        return;
      }

      const result = await CommunicationService.getConversation(
        userId,
        otherUserId,
        parseInt(page as string, 10),
        parseInt(limit as string, 10)
      );

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
    }
  );

  // Get all user conversations
  static getConversations = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<PaginatedResponse<any>>
    ): Promise<void> => {
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

      const result = await CommunicationService.getUserConversations(
        userId,
        parseInt(page as string, 10),
        parseInt(limit as string, 10)
      );

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
    }
  );

  // Mark messages as read
  static markAsRead = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const userId = req.user?.id;
      const { otherUserId } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const count = await CommunicationService.markMessagesAsRead(
        userId,
        otherUserId
      );

      res.status(200).json({
        success: true,
        message: `${count} messages marked as read`,
        data: { markedAsRead: count },
      });
    }
  );

  // Mark specific message as read
  static markMessageAsRead = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const userId = req.user?.id;
      const { messageId } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const success = await CommunicationService.markMessageAsRead(
        messageId,
        userId
      );

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
    }
  );

  // Get allowed contacts
  static getContacts = asyncHandler(
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

      const contacts = await CommunicationService.getAllowedContacts(userId);

      res.status(200).json({
        success: true,
        data: contacts,
      });
    }
  );

  // Get message statistics
  static getMessageStats = asyncHandler(
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

      const stats = await CommunicationService.getMessageStats(userId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    }
  );

  // Send bulk messages (admin/school staff only)
  static sendBulkMessages = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const senderId = req.user?.id;
      const bulkData: BulkMessageData = req.body;

      if (!senderId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      // Validate user role (only school staff and admin can send bulk messages)
      const user = await prisma.user.findUnique({
        where: { id: senderId },
        select: { role: true },
      });

      if (!user || !["SCHOOL_STAFF", "ADMIN"].includes(user.role)) {
        res.status(403).json({
          success: false,
          message:
            "Only school staff and administrators can send bulk messages",
        });
        return;
      }

      const results = await CommunicationService.sendBulkMessages(
        senderId,
        bulkData
      );

      const successCount = results.filter((r: any) => r.success).length;
      const failureCount = results.filter((r: any) => !r.success).length;

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
    }
  );

  // Delete a message
  static deleteMessage = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const userId = req.user?.id;
      const { messageId } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const success = await CommunicationService.deleteMessage(
        messageId,
        userId
      );

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
    }
  );

  // Search messages
  static searchMessages = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<PaginatedResponse<any>>
    ): Promise<void> => {
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

      const result = await CommunicationService.searchMessages(
        userId,
        query.trim(),
        parseInt(page as string, 10),
        parseInt(limit as string, 10)
      );

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
    }
  );

  // Get emergency contacts for quick messaging
  static getEmergencyContacts = asyncHandler(
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

      // Get school staff and admin contacts for emergency messaging
      const emergencyContacts = await prisma.user.findMany({
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
    }
  );

  // Send emergency message (creates both message and notification)
  static sendEmergencyMessage = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
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
      const message = await CommunicationService.sendMessage(senderId, {
        receiverId,
        type: "EMERGENCY",
        content,
      });

      res.status(201).json({
        success: true,
        message: "Emergency message sent successfully",
        data: message,
      });
    }
  );

  // Get unread message count
  static getUnreadCount = asyncHandler(
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

      const unreadCount = await prisma.message.count({
        where: {
          receiverId: userId,
          isRead: false,
        },
      });

      res.status(200).json({
        success: true,
        data: { unreadCount },
      });
    }
  );

  // Clean up old messages (admin only)
  static cleanupMessages = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { daysToKeep = 90 } = req.query;

      const deletedCount = await CommunicationService.cleanupOldMessages(
        parseInt(daysToKeep as string, 10)
      );

      res.status(200).json({
        success: true,
        message: `Cleaned up ${deletedCount} old messages`,
        data: { deletedCount },
      });
    }
  );
}
