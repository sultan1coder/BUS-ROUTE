import { Response } from "express";
import { AuthenticatedRequest, ApiResponse } from "../types";
import {
  ETASpeedService,
  ETACalculation,
  SpeedViolation,
  ETAAnalysis,
  SpeedAnalytics,
} from "../services/etaSpeedService";
import { asyncHandler } from "../middleware/errorHandler";
import prisma from "../config/database";

export class ETASpeedController {
  // Calculate ETA for a bus
  static calculateETA = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse<ETACalculation>>
    ): Promise<void> => {
      const { busId } = req.params;

      const eta = await ETASpeedService.calculateETA(busId);

      res.status(200).json({
        success: true,
        data: eta,
      });
    }
  );

  // Monitor speed and check for violations
  static monitorSpeed = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse<SpeedViolation | null>>
    ): Promise<void> => {
      const { busId } = req.params;
      const { currentSpeed, latitude, longitude } = req.body;

      if (
        typeof currentSpeed !== "number" ||
        typeof latitude !== "number" ||
        typeof longitude !== "number"
      ) {
        res.status(400).json({
          success: false,
          message:
            "currentSpeed, latitude, and longitude are required and must be numbers",
        });
        return;
      }

      const violation = await ETASpeedService.monitorSpeed(
        busId,
        currentSpeed,
        { latitude, longitude }
      );

      res.status(200).json({
        success: true,
        data: violation,
        message: violation
          ? "Speed violation detected and recorded"
          : "Speed within limits",
      });
    }
  );

  // Analyze ETA performance
  static analyzeETA = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse<ETAAnalysis | null>>
    ): Promise<void> => {
      const { busId } = req.params;

      const analysis = await ETASpeedService.analyzeETA(busId);

      res.status(200).json({
        success: true,
        data: analysis,
      });
    }
  );

  // Get speed analytics for a bus
  static getSpeedAnalytics = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse<SpeedAnalytics>>
    ): Promise<void> => {
      const { busId } = req.params;
      const { startDate, endDate } = req.query;

      const analytics = await ETASpeedService.getSpeedAnalytics(
        busId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.status(200).json({
        success: true,
        data: analytics,
      });
    }
  );

  // Get fleet-wide speed statistics
  static getFleetSpeedStats = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { schoolId } = req.query;

      const stats = await ETASpeedService.getFleetSpeedStats(
        schoolId as string
      );

      res.status(200).json({
        success: true,
        data: stats,
      });
    }
  );

  // Predict ETA based on historical data
  static predictETA = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { busId } = req.params;
      const { stopId } = req.query;

      if (!stopId) {
        res.status(400).json({
          success: false,
          message: "stopId parameter is required",
        });
        return;
      }

      const prediction = await ETASpeedService.predictETA(
        busId,
        stopId as string
      );

      res.status(200).json({
        success: true,
        data: prediction,
      });
    }
  );

  // Get speed violations for a bus
  static getSpeedViolations = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { busId } = req.params;
      const { startDate, endDate, severity, page = 1, limit = 20 } = req.query;

      const where: any = { busId };

      if (startDate || endDate) {
        where.timestamp = {};
        if (startDate) where.timestamp.gte = new Date(startDate as string);
        if (endDate) where.timestamp.lte = new Date(endDate as string);
      }

      if (severity) {
        where.severity = severity;
      }

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      const [violations, total] = await Promise.all([
        prisma.speedViolation.findMany({
          where,
          include: {
            bus: {
              select: {
                id: true,
                plateNumber: true,
                model: true,
              },
            },
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
          orderBy: { timestamp: "desc" },
          skip,
          take: parseInt(limit as string),
        }),
        prisma.speedViolation.count({ where }),
      ]);

      const totalPages = Math.ceil(total / parseInt(limit as string));

      res.status(200).json({
        success: true,
        data: violations,
        meta: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages,
        },
      });
    }
  );

  // Get ETA alerts for delayed buses
  static getETAAllerts = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { schoolId } = req.query;

      // Get all active buses for the school
      const where: any = { isActive: true };
      if (schoolId) {
        where.schoolId = schoolId;
      }

      const buses = await prisma.bus.findMany({
        where,
        include: {
          school: {
            select: {
              id: true,
              name: true,
            },
          },
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

      const alerts: any[] = [];

      for (const bus of buses) {
        try {
          const analysis = await ETASpeedService.analyzeETA(bus.id);
          if (analysis && analysis.isDelayed && analysis.delayMinutes > 5) {
            alerts.push({
              bus: {
                id: bus.id,
                plateNumber: bus.plateNumber,
                school: bus.school,
                driver: bus.driver,
              },
              eta: analysis,
              severity: analysis.delayMinutes > 15 ? "HIGH" : "MEDIUM",
            });
          }
        } catch (error) {
          // Skip buses with calculation errors
          console.warn(`Failed to calculate ETA for bus ${bus.id}:`, error);
        }
      }

      // Sort by delay severity
      alerts.sort((a, b) => b.eta.delayMinutes - a.eta.delayMinutes);

      res.status(200).json({
        success: true,
        data: {
          totalAlerts: alerts.length,
          alerts,
          summary: {
            highSeverity: alerts.filter((a) => a.severity === "HIGH").length,
            mediumSeverity: alerts.filter((a) => a.severity === "MEDIUM")
              .length,
          },
        },
      });
    }
  );

  // Bulk speed monitoring (for GPS devices)
  static bulkSpeedMonitoring = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { readings } = req.body;

      if (!Array.isArray(readings)) {
        res.status(400).json({
          success: false,
          message: "readings must be an array",
        });
        return;
      }

      const results: any[] = [];
      let violationsCount = 0;

      for (const reading of readings) {
        const { busId, speed, latitude, longitude } = reading;

        try {
          const violation = await ETASpeedService.monitorSpeed(busId, speed, {
            latitude,
            longitude,
          });

          results.push({
            busId,
            speed,
            location: { latitude, longitude },
            violation: violation || null,
            success: true,
          });

          if (violation) {
            violationsCount++;
          }
        } catch (error: any) {
          results.push({
            busId,
            speed,
            location: { latitude, longitude },
            success: false,
            error: error.message,
          });
        }
      }

      res.status(200).json({
        success: true,
        message: `Processed ${readings.length} speed readings, ${violationsCount} violations detected`,
        data: {
          total: readings.length,
          violations: violationsCount,
          results,
        },
      });
    }
  );

  // Get speed violation statistics
  static getSpeedViolationStats = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { schoolId, startDate, endDate } = req.query;

      const where: any = {};

      if (schoolId) {
        where.bus = { schoolId };
      }

      if (startDate || endDate) {
        where.timestamp = {};
        if (startDate) where.timestamp.gte = new Date(startDate as string);
        if (endDate) where.timestamp.lte = new Date(endDate as string);
      }

      const [
        totalViolations,
        violationsBySeverity,
        violationsByBus,
        recentViolations,
      ] = await Promise.all([
        prisma.speedViolation.count({ where }),

        prisma.speedViolation.groupBy({
          by: ["severity"],
          where,
          _count: true,
        }),

        prisma.speedViolation.groupBy({
          by: ["busId"],
          where,
          _count: true,
          orderBy: { _count: { busId: "desc" } },
          take: 10,
        }),

        prisma.speedViolation.findMany({
          where,
          include: {
            bus: {
              select: {
                plateNumber: true,
                model: true,
              },
            },
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
          orderBy: { timestamp: "desc" },
          take: 20,
        }),
      ]);

      // Get bus details for violations by bus
      const busDetails = await Promise.all(
        violationsByBus.map(async (item) => {
          const bus = await prisma.bus.findUnique({
            where: { id: item.busId },
            select: {
              id: true,
              plateNumber: true,
              model: true,
            },
          });
          return {
            bus,
            violations: item._count,
          };
        })
      );

      res.status(200).json({
        success: true,
        data: {
          summary: {
            totalViolations,
            period: {
              start: startDate || null,
              end: endDate || null,
            },
          },
          bySeverity: violationsBySeverity.reduce((acc, item) => {
            acc[item.severity] = item._count;
            return acc;
          }, {} as Record<string, number>),
          topViolatingBuses: busDetails,
          recentViolations,
        },
      });
    }
  );
}
