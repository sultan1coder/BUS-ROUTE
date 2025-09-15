import prisma from "../config/database";
import { io } from "../server";
import { CustomError } from "../middleware/errorHandler";

export interface SendMessageData {
  receiverId: string;
  type: "TEXT" | "IMAGE" | "EMERGENCY";
  content: string;
  attachment?: string;
}

export interface ConversationData {
  participantId: string;
  page?: number;
  limit?: number;
}

export interface MessageThread {
  id: string;
  participants: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    avatar?: string | null;
  }[];
  lastMessage: {
    id: string;
    content: string;
    type: string;
    sentAt: Date;
    senderId: string;
  };
  unreadCount: number;
  updatedAt: Date;
}

export interface BulkMessageData {
  receiverIds: string[];
  type: "TEXT" | "IMAGE" | "EMERGENCY";
  content: string;
  attachment?: string;
}

export class CommunicationService {
  // Send a message to another user
  static async sendMessage(
    senderId: string,
    messageData: SendMessageData
  ): Promise<any> {
    const { receiverId, type, content, attachment } = messageData;

    // Validate that receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true, role: true },
    });

    if (!receiver) {
      throw new CustomError("Recipient not found", 404);
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        type,
        content,
        attachment,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            avatar: true,
          },
        },
      },
    });

    // Emit real-time message via Socket.IO
    const socketRooms = this.getUserSocketRooms(receiverId);
    socketRooms.forEach((room) => {
      io.to(room).emit("new_message", {
        id: message.id,
        senderId: message.senderId,
        receiverId: message.receiverId,
        type: message.type,
        content: message.content,
        attachment: message.attachment,
        sentAt: message.sentAt,
        sender: message.sender,
      });
    });

    // If it's an emergency message, also notify via push notification
    if (type === "EMERGENCY") {
      await this.sendEmergencyAlert(senderId, receiverId, content);
    }

    return message;
  }

  // Send bulk messages to multiple recipients
  static async sendBulkMessages(
    senderId: string,
    bulkData: BulkMessageData
  ): Promise<any[]> {
    const { receiverIds, type, content, attachment } = bulkData;
    const results: any[] = [];

    for (const receiverId of receiverIds) {
      try {
        const message = await this.sendMessage(senderId, {
          receiverId,
          type,
          content,
          attachment,
        });
        results.push({ success: true, receiverId, messageId: message.id });
      } catch (error: any) {
        results.push({
          success: false,
          receiverId,
          error: error.message,
        });
      }
    }

    return results;
  }

  // Get conversation between two users
  static async getConversation(
    userId: string,
    otherUserId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    messages: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    // Get messages between the two users (both directions)
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            avatar: true,
          },
        },
      },
      orderBy: { sentAt: "desc" },
      skip,
      take: limit,
    });

    const total = await prisma.message.count({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      messages,
      total,
      page,
      limit,
      totalPages,
    };
  }

  // Get all conversations for a user
  static async getUserConversations(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    conversations: MessageThread[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    // Get all unique conversation partners
    const sentMessages = await prisma.message.findMany({
      where: { senderId: userId },
      select: { receiverId: true },
      distinct: ["receiverId"],
    });

    const receivedMessages = await prisma.message.findMany({
      where: { receiverId: userId },
      select: { senderId: true },
      distinct: ["senderId"],
    });

    const partnerIds = [
      ...new Set([
        ...sentMessages.map((m) => m.receiverId),
        ...receivedMessages.map((m) => m.senderId),
      ]),
    ];

    // Get conversation details for each partner
    const conversations: MessageThread[] = [];

    for (const partnerId of partnerIds) {
      try {
        const partner = await prisma.user.findUnique({
          where: { id: partnerId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            avatar: true,
          },
        });

        if (!partner) continue;

        // Get last message
        const lastMessage = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: userId, receiverId: partnerId },
              { senderId: partnerId, receiverId: userId },
            ],
          },
          orderBy: { sentAt: "desc" },
          select: {
            id: true,
            content: true,
            type: true,
            sentAt: true,
            senderId: true,
          },
        });

        if (!lastMessage) continue;

        // Count unread messages from this partner
        const unreadCount = await prisma.message.count({
          where: {
            senderId: partnerId,
            receiverId: userId,
            isRead: false,
          },
        });

        conversations.push({
          id: `${userId}_${partnerId}`,
          participants: [partner],
          lastMessage,
          unreadCount,
          updatedAt: lastMessage.sentAt,
        });
      } catch (error) {
        console.error(`Error getting conversation with ${partnerId}:`, error);
      }
    }

    // Sort conversations by last message date
    conversations.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    // Apply pagination
    const total = conversations.length;
    const paginatedConversations = conversations.slice(skip, skip + limit);
    const totalPages = Math.ceil(total / limit);

    return {
      conversations: paginatedConversations,
      total,
      page,
      limit,
      totalPages,
    };
  }

  // Mark messages as read
  static async markMessagesAsRead(
    userId: string,
    otherUserId: string
  ): Promise<number> {
    const result = await prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return result.count;
  }

  // Mark specific message as read
  static async markMessageAsRead(
    messageId: string,
    userId: string
  ): Promise<boolean> {
    try {
      const result = await prisma.message.updateMany({
        where: {
          id: messageId,
          receiverId: userId,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return result.count > 0;
    } catch (error) {
      console.error("Error marking message as read:", error);
      return false;
    }
  }

  // Get message statistics for a user
  static async getMessageStats(userId: string): Promise<{
    totalMessages: number;
    unreadMessages: number;
    conversationsCount: number;
    recentActivity: any[];
  }> {
    const [totalMessages, unreadMessages, conversationsResult, recentActivity] =
      await Promise.all([
        // Total messages received
        prisma.message.count({
          where: { receiverId: userId },
        }),

        // Unread messages
        prisma.message.count({
          where: {
            receiverId: userId,
            isRead: false,
          },
        }),

        // Conversations count
        this.getUserConversations(userId, 1, 1000),

        // Recent messages (last 7 days)
        prisma.message.findMany({
          where: {
            OR: [{ senderId: userId }, { receiverId: userId }],
            sentAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            receiver: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { sentAt: "desc" },
          take: 20,
        }),
      ]);

    return {
      totalMessages,
      unreadMessages,
      conversationsCount: conversationsResult.total,
      recentActivity,
    };
  }

  // Send emergency alert via messaging
  private static async sendEmergencyAlert(
    senderId: string,
    receiverId: string,
    content: string
  ): Promise<void> {
    try {
      // Also send as a regular emergency notification
      const { NotificationService } = await import("./notificationService");

      await NotificationService.sendNotification({
        type: "EMERGENCY",
        title: "Emergency Message",
        message: `Emergency: ${content}`,
        recipientId: receiverId,
        priority: "critical",
        data: {
          senderId,
          messageType: "emergency",
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error("Error sending emergency alert:", error);
    }
  }

  // Get allowed communication partners for a user
  static async getAllowedContacts(userId: string): Promise<any[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    let contacts: any[] = [];

    switch (user.role) {
      case "PARENT":
        // Parents can communicate with school staff and their children's drivers
        const parentContacts = await this.getParentContacts(userId);
        contacts = parentContacts;
        break;

      case "DRIVER":
        // Drivers can communicate with school staff and parents of students on their routes
        const driverContacts = await this.getDriverContacts(userId);
        contacts = driverContacts;
        break;

      case "SCHOOL_STAFF":
      case "ADMIN":
        // School staff can communicate with everyone
        const allContacts = await this.getAllContacts();
        contacts = allContacts;
        break;

      default:
        contacts = [];
    }

    return contacts;
  }

  // Get contacts for a parent (school staff and drivers)
  private static async getParentContacts(parentId: string): Promise<any[]> {
    const contacts: any[] = [];

    // Get school staff
    const schoolStaff = await prisma.user.findMany({
      where: {
        role: { in: ["SCHOOL_STAFF", "ADMIN"] },
        schoolStaff: {
          isNot: null,
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
      },
    });

    contacts.push(
      ...schoolStaff.map((staff) => ({
        ...staff,
        contactType: "school_staff",
      }))
    );

    // Get drivers of children's buses
    const childrenDrivers = await prisma.user.findMany({
      where: {
        driver: {
          bus: {
            routes: {
              some: {
                assignments: {
                  some: {
                    student: {
                      parentId,
                    },
                    isActive: true,
                  },
                },
              },
            },
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        driver: {
          select: {
            bus: {
              select: {
                id: true,
                plateNumber: true,
              },
            },
          },
        },
      },
    });

    contacts.push(
      ...childrenDrivers.map((driver) => ({
        ...driver,
        contactType: "driver",
        busInfo: driver.driver?.bus,
      }))
    );

    return contacts;
  }

  // Get contacts for a driver (school staff and parents)
  private static async getDriverContacts(driverId: string): Promise<any[]> {
    const contacts: any[] = [];

    // Get school staff
    const schoolStaff = await prisma.user.findMany({
      where: {
        role: { in: ["SCHOOL_STAFF", "ADMIN"] },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
      },
    });

    contacts.push(
      ...schoolStaff.map((staff) => ({
        ...staff,
        contactType: "school_staff",
      }))
    );

    // Get parents of students on driver's routes
    const parents = await prisma.user.findMany({
      where: {
        parent: {
          students: {
            some: {
              assignments: {
                some: {
                  route: {
                    bus: {
                      driverId,
                    },
                  },
                  isActive: true,
                },
              },
            },
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        parent: {
          select: {
            students: {
              where: {
                assignments: {
                  some: {
                    route: {
                      bus: {
                        driverId,
                      },
                    },
                  },
                },
              },
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    contacts.push(
      ...parents.map((parent) => ({
        ...parent,
        contactType: "parent",
        childrenInfo: parent.parent?.students || [],
      }))
    );

    return contacts;
  }

  // Get all contacts (for school staff/admin)
  private static async getAllContacts(): Promise<any[]> {
    const contacts = await prisma.user.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
      },
      orderBy: [{ role: "asc" }, { firstName: "asc" }],
    });

    return contacts.map((contact) => ({
      ...contact,
      contactType: contact.role.toLowerCase().replace("_", "_"),
    }));
  }

  // Delete a message (soft delete by marking as deleted)
  static async deleteMessage(
    messageId: string,
    userId: string
  ): Promise<boolean> {
    try {
      // Check if user is sender or receiver
      const message = await prisma.message.findFirst({
        where: {
          id: messageId,
          OR: [{ senderId: userId }, { receiverId: userId }],
        },
      });

      if (!message) {
        return false;
      }

      // For now, we'll implement hard delete. In production, you might want soft delete
      await prisma.message.delete({
        where: { id: messageId },
      });

      return true;
    } catch (error) {
      console.error("Error deleting message:", error);
      return false;
    }
  }

  // Search messages
  static async searchMessages(
    userId: string,
    query: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    messages: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
        content: {
          contains: query,
          mode: "insensitive",
        },
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            avatar: true,
          },
        },
      },
      orderBy: { sentAt: "desc" },
      skip,
      take: limit,
    });

    const total = await prisma.message.count({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
        content: {
          contains: query,
          mode: "insensitive",
        },
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      messages,
      total,
      page,
      limit,
      totalPages,
    };
  }

  // Get Socket.IO rooms for a user
  private static getUserSocketRooms(userId: string): string[] {
    return [`user_${userId}`, "messages:all"];
  }

  // Clean up old messages
  static async cleanupOldMessages(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await prisma.message.deleteMany({
      where: {
        sentAt: {
          lt: cutoffDate,
        },
        isRead: true, // Only delete read messages
      },
    });

    return result.count;
  }
}
