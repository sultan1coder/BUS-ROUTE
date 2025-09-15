import prisma from "../config/database";
import { io } from "../server";
import { getBusLocation } from "../config/redis";

export interface NotificationData {
  type: any; // Will be NotificationType enum
  title: string;
  message: string;
  recipientId: string; // User ID (required)
  priority: "low" | "medium" | "high" | "critical";
  data?: any; // Additional context data
}

export interface PushNotificationData {
  userId: string;
  title: string;
  body: string;
  data?: any;
  sound?: string;
  badge?: number;
}

export interface NotificationPreferences {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  busLocationUpdates: boolean;
  studentPickupAlerts: boolean;
  studentDropAlerts: boolean;
  delayAlerts: boolean;
  emergencyAlerts: boolean;
  speedViolationAlerts: boolean;
  attendanceUpdates: boolean;
  quietHoursStart?: string | null; // HH:MM format
  quietHoursEnd?: string | null; // HH:MM format
}

export class NotificationService {
  // Send notification to a specific user
  static async sendNotification(
    notificationData: NotificationData
  ): Promise<any> {
    const { type, title, message, recipientId, priority, data } =
      notificationData;

    if (!recipientId) {
      throw new Error("Recipient ID is required for notifications");
    }

    // Create notification record in database
    const notification = await prisma.notification.create({
      data: {
        userId: recipientId,
        type,
        title,
        message,
        priority:
          priority === "low"
            ? "LOW"
            : priority === "high"
            ? "HIGH"
            : priority === "critical"
            ? "CRITICAL"
            : "MEDIUM",
        data: data ? data : null,
      },
    });

    // Send real-time notification via Socket.IO
    if (recipientId) {
      const socketRooms = this.getUserSocketRooms(recipientId);
      socketRooms.forEach((room) => {
        io.to(room).emit("notification", {
          id: notification.id,
          type,
          title,
          message,
          priority,
          data,
          timestamp: notification.sentAt,
        });
      });
    }

    // Send push notification if applicable
    if (recipientId && priority !== "low") {
      await this.sendPushNotification({
        userId: recipientId,
        title,
        body: message,
        data: {
          type,
          notificationId: notification.id,
          ...data,
        },
      });
    }

    return notification;
  }

  // Send bulk notifications to multiple users
  static async sendBulkNotifications(
    notifications: NotificationData[],
    userIds?: string[]
  ): Promise<any[]> {
    const results: any[] = [];

    for (const notificationData of notifications) {
      try {
        // If userIds provided, send to each user
        if (userIds && userIds.length > 0) {
          for (const userId of userIds) {
            const result = await this.sendNotification({
              ...notificationData,
              recipientId: userId,
            });
            results.push({ success: true, userId, notificationId: result.id });
          }
        } else {
          const result = await this.sendNotification(notificationData);
          results.push({ success: true, notificationId: result.id });
        }
      } catch (error: any) {
        results.push({
          success: false,
          error: error.message,
          notificationData,
        });
      }
    }

    return results;
  }

  // Notify parents about bus location updates
  static async notifyBusLocation(busId: string): Promise<void> {
    try {
      const busLocation = await getBusLocation(busId);
      if (!busLocation) return;

      // Get all students assigned to this bus
      const students = await prisma.student.findMany({
        where: {
          assignments: {
            some: {
              route: {
                busId,
              },
              isActive: true,
            },
          },
          isActive: true,
        },
        include: {
          parent: {
            include: {
              user: true,
            },
          },
        },
      });

      // Get parent notification preferences
      const parentNotifications: NotificationData[] = [];

      for (const student of students) {
        if (student.parent?.user) {
          const preferences = await this.getUserNotificationPreferences(
            student.parent.userId
          );

          if (preferences?.busLocationUpdates) {
            parentNotifications.push({
              type: "BUS_LOCATION_UPDATE",
              title: `Bus Location Update - ${student.firstName}`,
              message: `${
                student.firstName
              }'s bus is currently at ${this.formatLocation(
                busLocation
              )}. ETA: ${
                busLocation.estimatedArrival
                  ? this.formatTime(busLocation.estimatedArrival)
                  : "Calculating..."
              }`,
              recipientId: student.parent.userId,
              priority: "low",
              data: {
                busLocation,
                student: {
                  id: student.id,
                  firstName: student.firstName,
                  lastName: student.lastName,
                },
              },
            });
          }
        }
      }

      if (parentNotifications.length > 0) {
        await this.sendBulkNotifications(parentNotifications);
      }
    } catch (error) {
      console.error("Error sending bus location notifications:", error);
    }
  }

  // Notify parents about student pickup
  static async notifyStudentPickup(
    studentId: string,
    busId: string,
    tripId?: string
  ): Promise<void> {
    try {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          parent: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!student?.parent?.user) return;

      const preferences = await this.getUserNotificationPreferences(
        student.parent.userId
      );
      if (!preferences?.studentPickupAlerts) return;

      const bus = await prisma.bus.findUnique({
        where: { id: busId },
        select: {
          plateNumber: true,
          model: true,
          driver: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      await this.sendNotification({
        type: "STUDENT_PICKUP",
        title: `Student Picked Up - ${student.firstName}`,
        message: `${student.firstName} ${
          student.lastName
        } has been picked up by bus ${bus?.plateNumber || busId} driven by ${
          bus?.driver?.user?.firstName || "Unknown Driver"
        }.`,
        recipientId: student.parent.userId,
        priority: "medium",
        data: {
          student,
          bus,
          action: "pickup",
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error("Error sending student pickup notification:", error);
    }
  }

  // Notify parents about student drop-off
  static async notifyStudentDrop(
    studentId: string,
    busId: string,
    tripId?: string
  ): Promise<void> {
    try {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          parent: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!student?.parent?.user) return;

      const preferences = await this.getUserNotificationPreferences(
        student.parent.userId
      );
      if (!preferences?.studentDropAlerts) return;

      const bus = await prisma.bus.findUnique({
        where: { id: busId },
        select: {
          plateNumber: true,
          model: true,
          driver: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      await this.sendNotification({
        type: "STUDENT_DROP",
        title: `Student Dropped Off - ${student.firstName}`,
        message: `${student.firstName} ${
          student.lastName
        } has been safely dropped off from bus ${bus?.plateNumber || busId}.`,
        recipientId: student.parent.userId,
        priority: "medium",
        data: {
          student,
          bus,
          action: "drop",
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error("Error sending student drop notification:", error);
    }
  }

  // Notify about bus delays
  static async notifyBusDelay(
    busId: string,
    delayMinutes: number,
    reason?: string
  ): Promise<void> {
    try {
      // Get all parents with children on this bus
      const parents = await prisma.user.findMany({
        where: {
          parent: {
            students: {
              some: {
                assignments: {
                  some: {
                    route: {
                      busId,
                    },
                    isActive: true,
                  },
                },
                isActive: true,
              },
            },
          },
        },
      });

      const notifications: NotificationData[] = [];

      for (const parent of parents) {
        const preferences = await this.getUserNotificationPreferences(
          parent.id
        );

        if (preferences?.delayAlerts) {
          notifications.push({
            type: "BUS_DELAY",
            title: "Bus Delay Alert",
            message: `Your child's bus is running ${delayMinutes} minutes behind schedule.${
              reason ? ` Reason: ${reason}` : ""
            }`,
            recipientId: parent.id,
            priority: delayMinutes > 15 ? "high" : "medium",
            data: {
              busId,
              delayMinutes,
              reason,
              timestamp: new Date(),
            },
          });
        }
      }

      if (notifications.length > 0) {
        await this.sendBulkNotifications(notifications);
      }
    } catch (error) {
      console.error("Error sending bus delay notifications:", error);
    }
  }

  // Notify about emergencies
  static async notifyEmergency(
    busId: string,
    emergencyType: string,
    description: string,
    location?: { latitude: number; longitude: number }
  ): Promise<void> {
    try {
      // Get all stakeholders: parents, school staff, admin
      const [parents, schoolStaff, admins] = await Promise.all([
        // Parents with children on the bus
        prisma.user.findMany({
          where: {
            parent: {
              students: {
                some: {
                  assignments: {
                    some: {
                      route: { busId },
                      isActive: true,
                    },
                  },
                  isActive: true,
                },
              },
            },
          },
        }),
        // School staff
        prisma.user.findMany({
          where: {
            schoolStaff: {
              school: {
                buses: {
                  some: { id: busId },
                },
              },
            },
          },
        }),
        // Admins
        prisma.user.findMany({
          where: { role: "ADMIN" },
        }),
      ]);

      const allRecipients = [...parents, ...schoolStaff, ...admins];
      const notifications: NotificationData[] = [];

      for (const user of allRecipients) {
        const preferences = await this.getUserNotificationPreferences(user.id);

        if (preferences?.emergencyAlerts) {
          notifications.push({
            type: "EMERGENCY",
            title: "Emergency Alert",
            message: `Emergency: ${emergencyType} - ${description}. Bus: ${busId}${
              location ? ` at ${this.formatLocation(location)}` : ""
            }`,
            recipientId: user.id,
            priority: "critical",
            data: {
              emergencyType,
              description,
              location,
              busId,
              timestamp: new Date(),
            },
          });
        }
      }

      if (notifications.length > 0) {
        await this.sendBulkNotifications(notifications);
      }
    } catch (error) {
      console.error("Error sending emergency notifications:", error);
    }
  }

  // Notify about speed violations
  static async notifySpeedViolation(
    busId: string,
    speed: number,
    speedLimit: number,
    severity: string,
    driverId?: string
  ): Promise<void> {
    try {
      // Notify school staff and admins
      const [schoolStaff, admins] = await Promise.all([
        prisma.user.findMany({
          where: {
            schoolStaff: {
              school: {
                buses: {
                  some: { id: busId },
                },
              },
            },
          },
        }),
        prisma.user.findMany({
          where: { role: "ADMIN" },
        }),
      ]);

      const recipients = [...schoolStaff, ...admins];
      const notifications: NotificationData[] = [];

      for (const user of recipients) {
        const preferences = await this.getUserNotificationPreferences(user.id);

        if (preferences?.speedViolationAlerts) {
          notifications.push({
            type: "SPEED_VIOLATION",
            title: "Speed Violation Alert",
            message: `Speed violation detected: ${speed} km/h (limit: ${speedLimit} km/h) on bus ${busId}. Severity: ${severity}`,
            recipientId: user.id,
            priority: severity === "CRITICAL" ? "high" : "medium",
            data: {
              busId,
              speed,
              speedLimit,
              severity,
              driverId,
              timestamp: new Date(),
            },
          });
        }
      }

      if (notifications.length > 0) {
        await this.sendBulkNotifications(notifications);
      }
    } catch (error) {
      console.error("Error sending speed violation notifications:", error);
    }
  }

  // Get user notification preferences
  static async getUserNotificationPreferences(
    userId: string
  ): Promise<NotificationPreferences | null> {
    try {
      const preferences = await prisma.notificationPreferences.findUnique({
        where: { userId },
      });

      if (!preferences) {
        // Return default preferences
        return {
          userId,
          emailNotifications: true,
          pushNotifications: true,
          smsNotifications: false,
          busLocationUpdates: true,
          studentPickupAlerts: true,
          studentDropAlerts: true,
          delayAlerts: true,
          emergencyAlerts: true,
          speedViolationAlerts: false,
          attendanceUpdates: true,
        };
      }

      return preferences;
    } catch (error) {
      console.error("Error getting notification preferences:", error);
      return null;
    }
  }

  // Update user notification preferences
  static async updateNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    const updatedPreferences = await prisma.notificationPreferences.upsert({
      where: { userId },
      update: preferences,
      create: {
        userId,
        ...preferences,
      },
    });

    return updatedPreferences;
  }

  // Get user notifications
  static async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false
  ): Promise<{
    notifications: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    unreadCount: number;
  }> {
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
    };

    if (unreadOnly) {
      where.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { sentAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      notifications,
      total,
      page,
      limit,
      totalPages,
      unreadCount,
    };
  }

  // Mark notification as read
  static async markNotificationAsRead(
    notificationId: string,
    userId: string
  ): Promise<boolean> {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return result.count > 0;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  }

  // Mark all notifications as read for a user
  static async markAllNotificationsAsRead(userId: string): Promise<number> {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return result.count;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return 0;
    }
  }

  // Send push notification (placeholder for actual push service integration)
  private static async sendPushNotification(
    data: PushNotificationData
  ): Promise<void> {
    // This would integrate with FCM, APNs, or other push services
    // For now, we'll just emit via Socket.IO
    const socketRooms = this.getUserSocketRooms(data.userId);
    socketRooms.forEach((room) => {
      io.to(room).emit("push_notification", {
        title: data.title,
        body: data.body,
        data: data.data,
        sound: data.sound || "default",
        badge: data.badge || 1,
      });
    });

    // Log push notification attempt
    console.log(`Push notification sent to user ${data.userId}: ${data.title}`);
  }

  // Get Socket.IO rooms for a user
  private static getUserSocketRooms(
    userId: string,
    recipientType?: string
  ): string[] {
    const rooms = [`user_${userId}`];

    if (recipientType) {
      rooms.push(`${recipientType}_${userId}`);
    }

    // Add general parent room for broadcasts
    if (recipientType === "parent") {
      rooms.push("parent:all");
    }

    return rooms;
  }

  // Format location for display
  private static formatLocation(location: any): string {
    // This could integrate with a geocoding service for address lookup
    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  }

  // Format time for display
  private static formatTime(date: Date): string {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  // Clean up old notifications
  static async cleanupOldNotifications(
    daysToKeep: number = 30
  ): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await prisma.notification.deleteMany({
      where: {
        sentAt: {
          lt: cutoffDate,
        },
        readAt: {
          not: null, // Only delete read notifications
        },
      },
    });

    return result.count;
  }
}
