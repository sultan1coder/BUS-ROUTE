import prisma from "../config/database";
import { io } from "../server";
import { CustomError } from "../middleware/errorHandler";
import { NotificationService } from "./notificationService";

export interface SOSAlertData {
  busId?: string;
  driverId?: string;
  type:
    | "SOS"
    | "ACCIDENT"
    | "BREAKDOWN"
    | "MEDICAL_EMERGENCY"
    | "THEFT"
    | "OTHER";
  description: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface GeofenceData {
  busId: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  alertOnEnter?: boolean;
  alertOnExit?: boolean;
}

export interface SpeedAlertData {
  busId: string;
  currentSpeed: number;
  speedLimit: number;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

export interface SafetyReport {
  totalAlerts: number;
  activeAlerts: number;
  resolvedAlerts: number;
  alertsByType: { type: string; count: number }[];
  alertsBySeverity: { severity: string; count: number }[];
  recentAlerts: any[];
  geofenceViolations: number;
  speedViolations: number;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

export class SafetyService {
  // Trigger SOS alert
  static async triggerSOSAlert(
    userId: string,
    alertData: SOSAlertData
  ): Promise<any> {
    const {
      busId,
      driverId,
      type,
      description,
      location,
      severity = "CRITICAL",
    } = alertData;

    // Verify user has permission to trigger alerts for this bus/driver
    if (busId || driverId) {
      await this.verifyUserAccess(userId, busId, driverId);
    }

    // Create emergency alert
    const alert = await prisma.emergencyAlert.create({
      data: {
        busId,
        driverId,
        type,
        severity,
        description,
        location: location ? JSON.stringify(location) : undefined,
      },
      include: {
        bus: {
          select: {
            id: true,
            plateNumber: true,
            driver: {
              select: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
        driver: {
          select: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    // Send emergency notifications
    await this.sendEmergencyNotifications(alert);

    // Emit real-time alert via Socket.IO
    this.emitRealtimeAlert("sos_alert", {
      id: alert.id,
      type: alert.type,
      severity: alert.severity,
      description: alert.description,
      location: location,
      bus: alert.bus || null,
      driver: alert.driver || null,
      createdAt: alert.createdAt,
    });

    // Log the emergency event
    await this.logEmergencyEvent(alert, "SOS_TRIGGERED");

    return alert;
  }

  // Create or update geofence
  static async createGeofence(geofenceData: GeofenceData): Promise<any> {
    const {
      busId,
      name,
      latitude,
      longitude,
      radius,
      alertOnEnter = false,
      alertOnExit = true,
    } = geofenceData;

    // Verify bus exists
    const bus = await prisma.bus.findUnique({
      where: { id: busId },
      select: { id: true, schoolId: true },
    });

    if (!bus) {
      throw new CustomError("Bus not found", 404);
    }

    const geofence = await prisma.geofence.create({
      data: {
        busId,
        name,
        latitude,
        longitude,
        radius,
        alertOnEnter,
        alertOnExit,
      },
    });

    return geofence;
  }

  // Check geofence violations
  static async checkGeofenceViolation(
    busId: string,
    latitude: number,
    longitude: number
  ): Promise<{
    violated: boolean;
    geofence?: any;
    action?: "ENTER" | "EXIT";
  }> {
    const geofences = await prisma.geofence.findMany({
      where: {
        busId,
        isActive: true,
      },
    });

    for (const geofence of geofences) {
      const distance = this.calculateDistance(
        latitude,
        longitude,
        geofence.latitude,
        geofence.longitude
      );

      const isInside = distance <= geofence.radius;

      // Check if this is an enter/exit event
      // For simplicity, we'll assume we need to track previous state
      // In a real implementation, you'd store last known position

      if (isInside && geofence.alertOnEnter) {
        return {
          violated: true,
          geofence,
          action: "ENTER",
        };
      }

      if (!isInside && geofence.alertOnExit) {
        return {
          violated: true,
          geofence,
          action: "EXIT",
        };
      }
    }

    return { violated: false };
  }

  // Handle geofence violation
  static async handleGeofenceViolation(
    busId: string,
    geofence: any,
    action: "ENTER" | "EXIT",
    location: { latitude: number; longitude: number }
  ): Promise<void> {
    // Create emergency alert for geofence violation
    const alert = await prisma.emergencyAlert.create({
      data: {
        busId,
        type: "GEOFENCE_VIOLATION",
        severity: "HIGH",
        description: `Bus ${
          action === "ENTER" ? "entered" : "exited"
        } geofence: ${geofence.name}`,
        location: JSON.stringify(location),
      },
    });

    // Send notifications
    await this.sendEmergencyNotifications(alert);

    // Emit real-time alert
    this.emitRealtimeAlert("geofence_violation", {
      busId,
      geofence,
      action,
      location,
      alertId: alert.id,
    });
  }

  // Monitor speed violations
  static async monitorSpeedViolation(speedData: SpeedAlertData): Promise<void> {
    const { busId, currentSpeed, speedLimit, location } = speedData;

    // Determine severity based on speed difference
    let severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";
    const speedDifference = currentSpeed - speedLimit;

    if (speedDifference >= 20) severity = "CRITICAL";
    else if (speedDifference >= 15) severity = "HIGH";
    else if (speedDifference >= 10) severity = "MEDIUM";

    // Create emergency alert
    const alert = await prisma.emergencyAlert.create({
      data: {
        busId,
        type: "SPEED_VIOLATION",
        severity,
        description: `Speed violation: ${currentSpeed} km/h (limit: ${speedLimit} km/h)`,
        location: location ? JSON.stringify(location) : undefined,
      },
    });

    // Send notifications
    await this.sendEmergencyNotifications(alert);

    // Emit real-time alert
    this.emitRealtimeAlert("speed_violation", {
      busId,
      currentSpeed,
      speedLimit,
      location,
      severity,
      alertId: alert.id,
    });

    // Also send speed violation notification
    const { NotificationService } = await import("./notificationService");
    await NotificationService.notifySpeedViolation(
      busId,
      currentSpeed,
      speedLimit,
      severity
    );
  }

  // Resolve emergency alert
  static async resolveAlert(
    alertId: string,
    resolvedBy: string,
    resolutionNotes?: string
  ): Promise<any> {
    // First get the current alert to access its description
    const currentAlert = await prisma.emergencyAlert.findUnique({
      where: { id: alertId },
      select: { description: true, resolved: true },
    });

    if (!currentAlert) {
      throw new CustomError("Alert not found", 404);
    }

    const alert = await prisma.emergencyAlert.update({
      where: { id: alertId },
      data: {
        resolved: true,
        resolvedAt: new Date(),
        resolvedBy,
        description: resolutionNotes
          ? `${currentAlert.description}\n\nResolution: ${resolutionNotes}`
          : undefined,
      },
      include: {
        bus: {
          select: {
            id: true,
            plateNumber: true,
          },
        },
        driver: {
          select: {
            user: {
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

    // Emit resolution event
    this.emitRealtimeAlert("alert_resolved", {
      alertId,
      resolvedBy,
      resolvedAt: alert.resolvedAt,
      resolutionNotes,
    });

    return alert;
  }

  // Get active emergency alerts
  static async getActiveAlerts(filters?: {
    busId?: string;
    driverId?: string;
    type?: string;
    severity?: string;
  }): Promise<any[]> {
    const where: any = {
      resolved: false,
    };

    if (filters?.busId) where.busId = filters.busId;
    if (filters?.driverId) where.driverId = filters.driverId;
    if (filters?.type) where.type = filters.type;
    if (filters?.severity) where.severity = filters.severity;

    const alerts = await prisma.emergencyAlert.findMany({
      where,
      include: {
        bus: {
          select: {
            id: true,
            plateNumber: true,
            driver: {
              select: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        driver: {
          select: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return alerts;
  }

  // Get geofences for a bus
  static async getBusGeofences(busId: string): Promise<any[]> {
    return await prisma.geofence.findMany({
      where: {
        busId,
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // Update geofence
  static async updateGeofence(
    geofenceId: string,
    updates: Partial<GeofenceData>
  ): Promise<any> {
    const geofence = await prisma.geofence.update({
      where: { id: geofenceId },
      data: updates,
    });

    return geofence;
  }

  // Delete geofence
  static async deleteGeofence(geofenceId: string): Promise<boolean> {
    try {
      await prisma.geofence.delete({
        where: { id: geofenceId },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get safety report
  static async getSafetyReport(
    schoolId?: string,
    dateRange?: { start: Date; end: Date }
  ): Promise<SafetyReport> {
    const where: any = {};

    if (schoolId) {
      where.bus = {
        schoolId,
      };
    }

    if (dateRange) {
      where.createdAt = {
        gte: dateRange.start,
        lte: dateRange.end,
      };
    }

    const [
      totalAlerts,
      activeAlerts,
      resolvedAlerts,
      alertsByType,
      alertsBySeverity,
      recentAlerts,
      geofenceViolations,
      speedViolations,
    ] = await Promise.all([
      // Total alerts
      prisma.emergencyAlert.count({ where }),

      // Active alerts
      prisma.emergencyAlert.count({
        where: { ...where, resolved: false },
      }),

      // Resolved alerts
      prisma.emergencyAlert.count({
        where: { ...where, resolved: true },
      }),

      // Alerts by type
      prisma.emergencyAlert.groupBy({
        by: ["type"],
        where,
        _count: true,
      }),

      // Alerts by severity
      prisma.emergencyAlert.groupBy({
        by: ["severity"],
        where,
        _count: true,
      }),

      // Recent alerts
      prisma.emergencyAlert.findMany({
        where,
        include: {
          bus: {
            select: {
              id: true,
              plateNumber: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),

      // Geofence violations
      prisma.emergencyAlert.count({
        where: { ...where, type: "GEOFENCE_VIOLATION" },
      }),

      // Speed violations
      prisma.emergencyAlert.count({
        where: { ...where, type: "SPEED_VIOLATION" },
      }),
    ]);

    return {
      totalAlerts,
      activeAlerts,
      resolvedAlerts,
      alertsByType: alertsByType.map((item) => ({
        type: item.type,
        count: item._count,
      })),
      alertsBySeverity: alertsBySeverity.map((item) => ({
        severity: item.severity,
        count: item._count,
      })),
      recentAlerts,
      geofenceViolations,
      speedViolations,
    };
  }

  // Get emergency contacts for a user
  static async getEmergencyContacts(
    userId: string
  ): Promise<EmergencyContact[]> {
    // In a real implementation, you'd have an EmergencyContact model
    // For now, we'll return school staff and admin contacts
    const contacts = await prisma.user.findMany({
      where: {
        role: { in: ["SCHOOL_STAFF", "ADMIN"] },
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
      },
    });

    return contacts.map((contact) => ({
      id: contact.id,
      name: `${contact.firstName} ${contact.lastName}`,
      phone: contact.phone || "",
      relationship: contact.role === "ADMIN" ? "Administrator" : "School Staff",
      isPrimary: contact.role === "ADMIN",
    }));
  }

  // Send emergency SMS/text message (placeholder)
  static async sendEmergencySMS(
    phoneNumber: string,
    message: string
  ): Promise<boolean> {
    // This would integrate with SMS service like Twilio, AWS SNS, etc.
    console.log(`Emergency SMS to ${phoneNumber}: ${message}`);

    // For now, just log and return success
    // In production, implement actual SMS sending
    return true;
  }

  // Log emergency event for audit trail
  private static async logEmergencyEvent(
    alert: any,
    event: string
  ): Promise<void> {
    // In a real implementation, you'd have an EmergencyLog model
    console.log(`Emergency Event: ${event}`, {
      alertId: alert.id,
      type: alert.type,
      severity: alert.severity,
      timestamp: new Date(),
    });
  }

  // Send emergency notifications to relevant parties
  private static async sendEmergencyNotifications(alert: any): Promise<void> {
    try {
      const { NotificationService } = await import("./notificationService");

      // Notify all admins and school staff
      const recipients = await prisma.user.findMany({
        where: {
          role: { in: ["ADMIN", "SCHOOL_STAFF"] },
        },
        select: { id: true },
      });

      // Send emergency alert notification
      await NotificationService.notifyEmergency(
        alert.busId || "Unknown Bus",
        alert.type,
        alert.description,
        alert.location ? JSON.parse(alert.location.toString()) : undefined
      );

      // If it's a critical alert, also send via messaging system
      if (alert.severity === "CRITICAL") {
        const { CommunicationService } = await import("./communicationService");

        // Send emergency message to school staff
        for (const recipient of recipients) {
          await CommunicationService.sendMessage(
            "system", // System-generated message
            {
              receiverId: recipient.id,
              type: "EMERGENCY",
              content: `EMERGENCY ALERT: ${alert.description}`,
            }
          );
        }
      }
    } catch (error) {
      console.error("Error sending emergency notifications:", error);
    }
  }

  // Emit real-time alert via Socket.IO
  private static emitRealtimeAlert(event: string, data: any): void {
    io.emit(event, data);

    // Also emit to specific rooms
    if (data.busId) {
      io.to(`bus_${data.busId}`).emit(event, data);
    }

    if (data.driverId) {
      io.to(`driver_${data.driverId}`).emit(event, data);
    }

    // Emit to admin room
    io.to("admin:all").emit(event, data);
  }

  // Calculate distance between two coordinates (Haversine formula)
  private static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  // Verify user has access to trigger alerts for bus/driver
  private static async verifyUserAccess(
    userId: string,
    busId?: string,
    driverId?: string
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    // Admins and school staff can trigger alerts for any bus/driver
    if (["ADMIN", "SCHOOL_STAFF"].includes(user.role)) {
      return;
    }

    // Drivers can only trigger alerts for their own bus
    if (user.role === "DRIVER" && busId) {
      const driver = await prisma.driver.findFirst({
        where: {
          userId,
          bus: {
            id: busId,
          },
        },
      });

      if (!driver) {
        throw new CustomError(
          "You don't have permission to trigger alerts for this bus",
          403
        );
      }
    }

    // Parents cannot trigger SOS alerts directly (only through driver app)
    if (user.role === "PARENT") {
      throw new CustomError(
        "Parents cannot trigger emergency alerts directly",
        403
      );
    }
  }

  // Clean up old resolved alerts
  static async cleanupOldAlerts(daysToKeep: number = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await prisma.emergencyAlert.deleteMany({
      where: {
        resolved: true,
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }

  // Get alert history
  static async getAlertHistory(
    filters?: {
      busId?: string;
      driverId?: string;
      type?: string;
      resolved?: boolean;
      startDate?: Date;
      endDate?: Date;
    },
    page: number = 1,
    limit: number = 20
  ): Promise<{
    alerts: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (filters?.busId) where.busId = filters.busId;
    if (filters?.driverId) where.driverId = filters.driverId;
    if (filters?.type) where.type = filters.type;
    if (filters?.resolved !== undefined) where.resolved = filters.resolved;

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const [alerts, total] = await Promise.all([
      prisma.emergencyAlert.findMany({
        where,
        include: {
          bus: {
            select: {
              id: true,
              plateNumber: true,
            },
          },
          driver: {
            select: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.emergencyAlert.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      alerts,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
