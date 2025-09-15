import { Response } from "express";
import { AuthenticatedRequest, ApiResponse, PaginatedResponse } from "../types";
import {
  DriverAppService,
  TripStartData,
  TripUpdate,
  StudentPickupData,
  StudentDropData,
  NavigationData,
} from "../services/driverAppService";
import { asyncHandler } from "../middleware/errorHandler";
import prisma from "../config/database";

export class DriverAppController {
  // Get driver dashboard
  static getDashboard = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const driverId = req.user?.id;

      if (!driverId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const dashboard = await DriverAppService.getDriverDashboard(driverId);

      res.status(200).json({
        success: true,
        data: dashboard,
      });
    }
  );

  // Start a trip
  static startTrip = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const driverId = req.user?.id;
      const tripData: TripStartData = req.body;

      if (!driverId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const trip = await DriverAppService.startTrip(driverId, tripData);

      res.status(201).json({
        success: true,
        message: "Trip started successfully",
        data: trip,
      });
    }
  );

  // Update trip status
  static updateTrip = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const driverId = req.user?.id;
      const { tripId } = req.params;
      const updateData: TripUpdate = req.body;

      if (!driverId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const trip = await DriverAppService.updateTrip(
        driverId,
        tripId,
        updateData
      );

      res.status(200).json({
        success: true,
        message: "Trip updated successfully",
        data: trip,
      });
    }
  );

  // Get current trip
  static getCurrentTrip = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const driverId = req.user?.id;

      if (!driverId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const trip = await DriverAppService.getCurrentTrip(driverId);

      res.status(200).json({
        success: true,
        data: trip,
      });
    }
  );

  // Get trip navigation data
  static getTripNavigation = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const driverId = req.user?.id;
      const navigationData: NavigationData = req.body;

      if (!driverId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const navigation = await DriverAppService.getTripNavigation(
        driverId,
        navigationData
      );

      res.status(200).json({
        success: true,
        data: navigation,
      });
    }
  );

  // Record student pickup
  static recordStudentPickup = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const driverId = req.user?.id;
      const { tripId } = req.params;
      const pickupData: StudentPickupData = req.body;

      if (!driverId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const attendance = await DriverAppService.recordStudentPickup(
        driverId,
        tripId,
        pickupData
      );

      res.status(201).json({
        success: true,
        message: "Student pickup recorded successfully",
        data: attendance,
      });
    }
  );

  // Record student drop-off
  static recordStudentDrop = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const driverId = req.user?.id;
      const { tripId } = req.params;
      const dropData: StudentDropData = req.body;

      if (!driverId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const attendance = await DriverAppService.recordStudentDrop(
        driverId,
        tripId,
        dropData
      );

      res.status(201).json({
        success: true,
        message: "Student drop-off recorded successfully",
        data: attendance,
      });
    }
  );

  // Get student manifest for trip
  static getStudentManifest = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const driverId = req.user?.id;
      const { tripId } = req.params;

      if (!driverId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const manifest = await DriverAppService.getStudentManifest(
        driverId,
        tripId
      );

      res.status(200).json({
        success: true,
        data: manifest,
      });
    }
  );

  // Update driver location
  static updateLocation = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const driverId = req.user?.id;
      const { latitude, longitude, speed, heading, accuracy } = req.body;

      if (!driverId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      if (!latitude || !longitude) {
        res.status(400).json({
          success: false,
          message: "Latitude and longitude are required",
        });
        return;
      }

      await DriverAppService.updateDriverLocation(
        driverId,
        {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        },
        {
          speed: speed ? parseFloat(speed) : undefined,
          heading: heading ? parseFloat(heading) : undefined,
          accuracy: accuracy ? parseFloat(accuracy) : undefined,
        }
      );

      res.status(200).json({
        success: true,
        message: "Location updated successfully",
      });
    }
  );

  // Get driver's assigned routes
  static getRoutes = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const driverId = req.user?.id;

      if (!driverId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const routes = await DriverAppService.getDriverRoutes(driverId);

      res.status(200).json({
        success: true,
        data: routes,
      });
    }
  );

  // Get trip history
  static getTripHistory = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<PaginatedResponse<any>>
    ): Promise<void> => {
      const driverId = req.user?.id;
      const { page = 1, limit = 20, startDate, endDate, status } = req.query;

      if (!driverId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
          data: [],
          meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
        });
        return;
      }

      const filters: any = {};
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (status) filters.status = status as string;

      const result = await DriverAppService.getDriverTripHistory(
        driverId,
        parseInt(page as string),
        parseInt(limit as string),
        filters
      );

      res.status(200).json({
        success: true,
        data: result.trips,
        meta: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    }
  );

  // Get driver report/earnings
  static getReport = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const driverId = req.user?.id;
      const { period = "monthly" } = req.query;

      if (!driverId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const report = await DriverAppService.getDriverReport(
        driverId,
        period as "daily" | "weekly" | "monthly"
      );

      res.status(200).json({
        success: true,
        data: report,
      });
    }
  );

  // Trigger emergency from driver app
  static triggerEmergency = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const driverId = req.user?.id;
      const emergencyData = req.body;

      if (!driverId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const alert = await DriverAppService.triggerDriverEmergency(
        driverId,
        emergencyData
      );

      res.status(201).json({
        success: true,
        message: "Emergency alert triggered successfully",
        data: alert,
      });
    }
  );

  // Update driver status
  static updateDriverStatus = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const driverId = req.user?.id;
      const { isOnline, status, currentLocation } = req.body;

      if (!driverId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      await DriverAppService.updateDriverStatus(driverId, {
        isOnline,
        status,
        currentLocation,
      });

      res.status(200).json({
        success: true,
        message: "Driver status updated successfully",
      });
    }
  );

  // Get route details with stops and students
  static getRouteDetails = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const driverId = req.user?.id;
      const { routeId } = req.params;

      if (!driverId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      // Verify driver has access to this route
      const route = await prisma.route.findFirst({
        where: {
          id: routeId,
          bus: {
            driver: {
              userId: driverId,
            },
          },
        },
        include: {
          stops: {
            include: {
              assignments: {
                where: { isActive: true },
                include: {
                  student: {
                    include: {
                      parent: {
                        include: {
                          user: true,
                        },
                      },
                    },
                  },
                },
              },
            },
            orderBy: { sequence: "asc" },
          },
          bus: true,
        },
      });

      if (!route) {
        res.status(404).json({
          success: false,
          message: "Route not found or access denied",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: route,
      });
    }
  );

  // Get stop details with student list
  static getStopDetails = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const driverId = req.user?.id;
      const { stopId } = req.params;

      if (!driverId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      // Verify driver has access to this stop (through their routes)
      const stop = await prisma.routeStop.findFirst({
        where: {
          id: stopId,
          route: {
            bus: {
              driver: {
                userId: driverId,
              },
            },
          },
        },
        include: {
          assignments: {
            where: { isActive: true },
            include: {
              student: {
                include: {
                  parent: {
                    include: {
                      user: true,
                    },
                  },
                },
              },
            },
          },
          route: {
            include: {
              bus: true,
            },
          },
        },
      });

      if (!stop) {
        res.status(404).json({
          success: false,
          message: "Stop not found or access denied",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: stop,
      });
    }
  );

  // Get trip summary
  static getTripSummary = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const driverId = req.user?.id;
      const { tripId } = req.params;

      if (!driverId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      // Verify driver owns this trip
      const trip = await prisma.trip.findFirst({
        where: {
          id: tripId,
          driver: {
            userId: driverId,
          },
        },
        include: {
          route: true,
          bus: true,
          attendance: {
            include: {
              student: true,
            },
          },
        },
      });

      if (!trip) {
        res.status(404).json({
          success: false,
          message: "Trip not found or access denied",
        });
        return;
      }

      const summary = {
        tripId: trip.id,
        routeName: trip.route.name,
        busPlateNumber: trip.bus.plateNumber,
        startTime: trip.actualStart || trip.scheduledStart,
        endTime: trip.actualEnd,
        status: trip.status,
        totalStudents: trip.attendance.length,
        pickedUpStudents: trip.attendance.filter(
          (a: any) => a.action === "pickup"
        ).length,
        droppedOffStudents: trip.attendance.filter(
          (a: any) => a.action === "drop"
        ).length,
        duration:
          trip.actualStart && trip.actualEnd
            ? Math.round(
                (trip.actualEnd.getTime() - trip.actualStart.getTime()) /
                  (1000 * 60)
              )
            : null,
        issues: [], // Would track any issues during the trip
      };

      res.status(200).json({
        success: true,
        data: summary,
      });
    }
  );

  // Quick attendance check for a student
  static quickAttendanceCheck = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const driverId = req.user?.id;
      const { studentId, tripId } = req.params;

      if (!driverId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      // Verify driver has access to this trip
      const trip = await prisma.trip.findFirst({
        where: {
          id: tripId,
          driver: {
            userId: driverId,
          },
        },
      });

      if (!trip) {
        res.status(404).json({
          success: false,
          message: "Trip not found or access denied",
        });
        return;
      }

      // Get student's attendance for this trip
      const attendance = await prisma.attendance.findFirst({
        where: {
          studentId,
          tripId,
        },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              grade: true,
              photo: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      if (!attendance) {
        res.status(404).json({
          success: false,
          message: "No attendance record found for this student on this trip",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          student: attendance.student,
          attendance: {
            id: attendance.id,
            status: attendance.status,
            pickupTime: attendance.pickupTime,
            dropTime: attendance.dropTime,
            notes: attendance.notes,
          },
        },
      });
    }
  );

  // Get driver notifications/alerts
  static getNotifications = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<PaginatedResponse<any>>
    ): Promise<void> => {
      const driverId = req.user?.id;
      const { page = 1, limit = 20, unreadOnly = false } = req.query;

      if (!driverId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
          data: [],
          meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
        });
        return;
      }

      const where: any = { recipientId: driverId };
      if (unreadOnly === "true") {
        where.isRead = false;
      }

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { sentAt: "desc" },
          skip: (parseInt(page as string) - 1) * parseInt(limit as string),
          take: parseInt(limit as string),
        }),
        prisma.notification.count({ where }),
      ]);

      const totalPages = Math.ceil(total / parseInt(limit as string));

      res.status(200).json({
        success: true,
        data: notifications,
        meta: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages,
        },
      });
    }
  );

  // Mark notification as read
  static markNotificationRead = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const driverId = req.user?.id;
      const { notificationId } = req.params;

      if (!driverId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const result = await prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId: driverId,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      if (result.count === 0) {
        res.status(404).json({
          success: false,
          message: "Notification not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Notification marked as read",
      });
    }
  );

  // Get driver settings/preferences
  static getDriverSettings = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const driverId = req.user?.id;

      if (!driverId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      // Get driver preferences (would be stored in a separate table in real implementation)
      const driver = await prisma.user.findUnique({
        where: { id: driverId },
        include: {
          driver: {
            include: {
              bus: true,
            },
          },
        },
      });

      const settings = {
        notifications: {
          tripStart: true,
          studentPickup: true,
          studentDrop: true,
          emergencyAlerts: true,
          routeChanges: true,
        },
        app: {
          language: "en",
          theme: "auto",
          units: "metric",
          autoStartTrip: false,
        },
        privacy: {
          shareLocation: true,
          allowParentContact: true,
        },
      };

      res.status(200).json({
        success: true,
        data: {
          driver,
          settings,
        },
      });
    }
  );

  // Update driver settings
  static updateDriverSettings = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const driverId = req.user?.id;
      const settings = req.body;

      if (!driverId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      // In a real implementation, save settings to database
      // For now, just return success

      res.status(200).json({
        success: true,
        message: "Settings updated successfully",
        data: settings,
      });
    }
  );
}
