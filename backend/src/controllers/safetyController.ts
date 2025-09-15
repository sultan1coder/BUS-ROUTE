import { Response } from "express";
import { AuthenticatedRequest, ApiResponse, PaginatedResponse } from "../types";
import {
  SafetyService,
  SOSAlertData,
  GeofenceData,
  SpeedAlertData,
} from "../services/safetyService";
import { asyncHandler } from "../middleware/errorHandler";
import prisma from "../config/database";

export class SafetyController {
  // Trigger SOS alert
  static triggerSOS = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const userId = req.user?.id;
      const alertData: SOSAlertData = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const alert = await SafetyService.triggerSOSAlert(userId, alertData);

      res.status(201).json({
        success: true,
        message: "SOS alert triggered successfully",
        data: alert,
      });
    }
  );

  // Create geofence
  static createGeofence = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const geofenceData: GeofenceData = req.body;

      const geofence = await SafetyService.createGeofence(geofenceData);

      res.status(201).json({
        success: true,
        message: "Geofence created successfully",
        data: geofence,
      });
    }
  );

  // Get geofences for a bus
  static getBusGeofences = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { busId } = req.params;

      const geofences = await SafetyService.getBusGeofences(busId);

      res.status(200).json({
        success: true,
        data: geofences,
      });
    }
  );

  // Update geofence
  static updateGeofence = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { geofenceId } = req.params;
      const updates = req.body;

      const geofence = await SafetyService.updateGeofence(geofenceId, updates);

      res.status(200).json({
        success: true,
        message: "Geofence updated successfully",
        data: geofence,
      });
    }
  );

  // Delete geofence
  static deleteGeofence = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { geofenceId } = req.params;

      const success = await SafetyService.deleteGeofence(geofenceId);

      if (!success) {
        res.status(404).json({
          success: false,
          message: "Geofence not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Geofence deleted successfully",
      });
    }
  );

  // Check geofence violation (called by GPS tracking system)
  static checkGeofenceViolation = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { busId, latitude, longitude } = req.body;

      if (!busId || latitude === undefined || longitude === undefined) {
        res.status(400).json({
          success: false,
          message: "Bus ID, latitude, and longitude are required",
        });
        return;
      }

      const result = await SafetyService.checkGeofenceViolation(
        busId,
        parseFloat(latitude),
        parseFloat(longitude)
      );

      if (result.violated && result.geofence) {
        // Handle the violation
        await SafetyService.handleGeofenceViolation(
          busId,
          result.geofence,
          result.action!,
          { latitude: parseFloat(latitude), longitude: parseFloat(longitude) }
        );
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    }
  );

  // Report speed violation
  static reportSpeedViolation = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const speedData: SpeedAlertData = req.body;

      await SafetyService.monitorSpeedViolation(speedData);

      res.status(201).json({
        success: true,
        message: "Speed violation reported successfully",
      });
    }
  );

  // Get active alerts
  static getActiveAlerts = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<PaginatedResponse<any>>
    ): Promise<void> => {
      const {
        busId,
        driverId,
        type,
        severity,
        page = 1,
        limit = 20,
      } = req.query;

      const filters: any = {};
      if (busId) filters.busId = busId as string;
      if (driverId) filters.driverId = driverId as string;
      if (type) filters.type = type as string;
      if (severity) filters.severity = severity as string;

      const alerts = await SafetyService.getActiveAlerts(filters);

      // Apply pagination
      const startIndex =
        (parseInt(page as string) - 1) * parseInt(limit as string);
      const endIndex = startIndex + parseInt(limit as string);
      const paginatedAlerts = alerts.slice(startIndex, endIndex);
      const totalPages = Math.ceil(alerts.length / parseInt(limit as string));

      res.status(200).json({
        success: true,
        data: paginatedAlerts,
        meta: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: alerts.length,
          totalPages,
        },
      });
    }
  );

  // Resolve alert
  static resolveAlert = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { alertId } = req.params;
      const { resolutionNotes } = req.body;
      const resolvedBy = req.user?.id;

      if (!resolvedBy) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const alert = await SafetyService.resolveAlert(
        alertId,
        resolvedBy,
        resolutionNotes
      );

      res.status(200).json({
        success: true,
        message: "Alert resolved successfully",
        data: alert,
      });
    }
  );

  // Get safety report
  static getSafetyReport = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { schoolId, startDate, endDate } = req.query;

      const dateRange =
        startDate && endDate
          ? {
              start: new Date(startDate as string),
              end: new Date(endDate as string),
            }
          : undefined;

      const report = await SafetyService.getSafetyReport(
        schoolId as string,
        dateRange
      );

      res.status(200).json({
        success: true,
        data: report,
      });
    }
  );

  // Get alert history
  static getAlertHistory = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<PaginatedResponse<any>>
    ): Promise<void> => {
      const {
        busId,
        driverId,
        type,
        resolved,
        startDate,
        endDate,
        page = 1,
        limit = 20,
      } = req.query;

      const filters: any = {};
      if (busId) filters.busId = busId as string;
      if (driverId) filters.driverId = driverId as string;
      if (type) filters.type = type as string;
      if (resolved !== undefined) filters.resolved = resolved === "true";
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const result = await SafetyService.getAlertHistory(
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.status(200).json({
        success: true,
        data: result.alerts,
        meta: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    }
  );

  // Get emergency contacts
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

      const contacts = await SafetyService.getEmergencyContacts(userId);

      res.status(200).json({
        success: true,
        data: contacts,
      });
    }
  );

  // Send emergency SMS (admin only)
  static sendEmergencySMS = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { phoneNumber, message } = req.body;

      // Validate user role
      const user = await prisma.user.findUnique({
        where: { id: req.user?.id },
        select: { role: true },
      });

      if (!user || !["ADMIN", "SCHOOL_STAFF"].includes(user.role)) {
        res.status(403).json({
          success: false,
          message:
            "Only administrators and school staff can send emergency SMS",
        });
        return;
      }

      const success = await SafetyService.sendEmergencySMS(
        phoneNumber,
        message
      );

      if (!success) {
        res.status(500).json({
          success: false,
          message: "Failed to send emergency SMS",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Emergency SMS sent successfully",
      });
    }
  );

  // Get real-time safety status
  static getSafetyStatus = asyncHandler(
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

      // Get active alerts count
      const activeAlertsCount = await prisma.emergencyAlert.count({
        where: { resolved: false },
      });

      // Get critical alerts
      const criticalAlerts = await prisma.emergencyAlert.findMany({
        where: {
          resolved: false,
          severity: "CRITICAL",
        },
        include: {
          bus: {
            select: {
              id: true,
              plateNumber: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      });

      // Get user's bus/driver safety info if applicable
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          role: true,
          driver: {
            select: {
              bus: {
                select: {
                  id: true,
                  plateNumber: true,
                  geofences: {
                    where: { isActive: true },
                    select: {
                      id: true,
                      name: true,
                      latitude: true,
                      longitude: true,
                      radius: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      const safetyStatus = {
        activeAlertsCount,
        criticalAlerts,
        userRole: user?.role,
        userBus: user?.driver?.bus || null,
        geofences: user?.driver?.bus?.geofences || [],
        lastUpdated: new Date(),
      };

      res.status(200).json({
        success: true,
        data: safetyStatus,
      });
    }
  );

  // Bulk resolve alerts
  static bulkResolveAlerts = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { alertIds, resolutionNotes } = req.body;
      const resolvedBy = req.user?.id;

      if (!resolvedBy) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      if (!Array.isArray(alertIds) || alertIds.length === 0) {
        res.status(400).json({
          success: false,
          message: "Alert IDs array is required",
        });
        return;
      }

      const results = [];
      for (const alertId of alertIds) {
        try {
          const alert = await SafetyService.resolveAlert(
            alertId,
            resolvedBy,
            resolutionNotes
          );
          results.push({ alertId, success: true, alert });
        } catch (error: any) {
          results.push({ alertId, success: false, error: error.message });
        }
      }

      const successCount = results.filter((r: any) => r.success).length;
      const failureCount = results.filter((r: any) => !r.success).length;

      res.status(200).json({
        success: true,
        message: `Bulk resolution completed: ${successCount} successful, ${failureCount} failed`,
        data: {
          total: alertIds.length,
          successful: successCount,
          failed: failureCount,
          results,
        },
      });
    }
  );

  // Get geofence statistics
  static getGeofenceStats = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { busId } = req.query;

      const where: any = {
        type: "GEOFENCE_VIOLATION",
      };

      if (busId) {
        where.busId = busId;
      }

      const [
        totalViolations,
        violationsToday,
        violationsThisWeek,
        violationsByBus,
      ] = await Promise.all([
        prisma.emergencyAlert.count({ where }),

        prisma.emergencyAlert.count({
          where: {
            ...where,
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),

        prisma.emergencyAlert.count({
          where: {
            ...where,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        }),

        prisma.emergencyAlert.groupBy({
          by: ["busId"],
          where,
          _count: true,
          orderBy: {
            _count: {
              busId: "desc",
            },
          },
          take: 10,
        }),
      ]);

      const stats = {
        totalViolations,
        violationsToday,
        violationsThisWeek,
        violationsByBus: Array.isArray(violationsByBus)
          ? violationsByBus.map((item: any) => ({
              busId: item.busId,
              count: item._count,
            }))
          : [],
      };

      res.status(200).json({
        success: true,
        data: stats,
      });
    }
  );

  // Get speed violation statistics
  static getSpeedViolationStats = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { busId, startDate, endDate } = req.query;

      const where: any = {
        type: "SPEED_VIOLATION",
      };

      if (busId) {
        where.busId = busId;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate as string);
        if (endDate) where.createdAt.lte = new Date(endDate as string);
      }

      const [
        totalViolations,
        violationsBySeverity,
        violationsByBus,
        recentViolations,
      ] = await Promise.all([
        prisma.emergencyAlert.count({ where }),

        prisma.emergencyAlert.groupBy({
          by: ["severity"],
          where,
          _count: true,
        }),

        prisma.emergencyAlert.groupBy({
          by: ["busId"],
          where,
          _count: true,
          orderBy: {
            _count: {
              busId: "desc",
            },
          },
          take: 10,
        }),

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
      ]);

      const stats = {
        totalViolations,
        violationsBySeverity: violationsBySeverity.map((item) => ({
          severity: item.severity,
          count: item._count,
        })),
        violationsByBus: Array.isArray(violationsByBus)
          ? violationsByBus.map((item: any) => ({
              busId: item.busId,
              count: item._count,
            }))
          : [],
        recentViolations,
      };

      res.status(200).json({
        success: true,
        data: stats,
      });
    }
  );

  // Cleanup old alerts (admin only)
  static cleanupAlerts = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { daysToKeep = 365 } = req.query;

      const deletedCount = await SafetyService.cleanupOldAlerts(
        parseInt(daysToKeep as string)
      );

      res.status(200).json({
        success: true,
        message: `Cleaned up ${deletedCount} old alerts`,
        data: { deletedCount },
      });
    }
  );
}
