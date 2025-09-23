import { Response } from "express";
import { AuthenticatedRequest, ApiResponse, PaginatedResponse } from "../types";
import {
  AdminService,
  CreateSchoolData,
  UpdateSchoolData,
} from "../services/adminService";
import { asyncHandler } from "../middleware/errorHandler";
import prisma from "../config/database";

export class AdminController {
  // Get system overview
  static getSystemOverview = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const overview = await AdminService.getSystemOverview();

      res.status(200).json({
        success: true,
        data: overview,
      });
    }
  );

  // Get complete dashboard data
  static getDashboard = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { schoolId, startDate, endDate } = req.query;

      const filters: any = {};

      if (schoolId) {
        filters.schoolId = schoolId as string;
      }

      if (startDate && endDate) {
        filters.dateRange = {
          start: new Date(startDate as string),
          end: new Date(endDate as string),
        };
      }

      const dashboardData = await AdminService.getDashboardData(filters);

      res.status(200).json({
        success: true,
        data: dashboardData,
      });
    }
  );

  // Get user analytics
  static getUserAnalytics = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { startDate, endDate } = req.query;

      const dateRange =
        startDate && endDate
          ? {
              start: new Date(startDate as string),
              end: new Date(endDate as string),
            }
          : undefined;

      const analytics = await AdminService.getUserAnalytics(dateRange);

      res.status(200).json({
        success: true,
        data: analytics,
      });
    }
  );

  // Get fleet analytics
  static getFleetAnalytics = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { startDate, endDate } = req.query;

      const dateRange =
        startDate && endDate
          ? {
              start: new Date(startDate as string),
              end: new Date(endDate as string),
            }
          : undefined;

      const analytics = await AdminService.getFleetAnalytics(dateRange);

      res.status(200).json({
        success: true,
        data: analytics,
      });
    }
  );

  // Get safety analytics
  static getSafetyAnalytics = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { startDate, endDate } = req.query;

      const dateRange =
        startDate && endDate
          ? {
              start: new Date(startDate as string),
              end: new Date(endDate as string),
            }
          : undefined;

      const analytics = await AdminService.getSafetyAnalytics(dateRange);

      res.status(200).json({
        success: true,
        data: analytics,
      });
    }
  );

  // Get communication analytics
  static getCommunicationAnalytics = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { startDate, endDate } = req.query;

      const dateRange =
        startDate && endDate
          ? {
              start: new Date(startDate as string),
              end: new Date(endDate as string),
            }
          : undefined;

      const analytics = await AdminService.getCommunicationAnalytics(dateRange);

      res.status(200).json({
        success: true,
        data: analytics,
      });
    }
  );

  // Get performance metrics
  static getPerformanceMetrics = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const metrics = await AdminService.getPerformanceMetrics();

      res.status(200).json({
        success: true,
        data: metrics,
      });
    }
  );

  // Get recent activities
  static getRecentActivities = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<PaginatedResponse<any>>
    ): Promise<void> => {
      const { limit = 20 } = req.query;

      const activities = await AdminService.getRecentActivities(
        parseInt(limit as string)
      );

      res.status(200).json({
        success: true,
        data: activities,
        meta: {
          page: 1,
          limit: parseInt(limit as string),
          total: activities.length,
          totalPages: 1,
        },
      });
    }
  );

  // Get detailed reports
  static getDetailedReport = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { reportType } = req.params;
      const { schoolId, startDate, endDate, groupBy } = req.query;

      const filters: any = {};

      if (schoolId) {
        filters.schoolId = schoolId as string;
      }

      if (startDate && endDate) {
        filters.dateRange = {
          start: new Date(startDate as string),
          end: new Date(endDate as string),
        };
      }

      if (groupBy) {
        filters.groupBy = groupBy as "day" | "week" | "month";
      }

      const report = await AdminService.getDetailedReport(
        reportType as
          | "users"
          | "fleet"
          | "safety"
          | "communication"
          | "financial",
        filters
      );

      res.status(200).json({
        success: true,
        data: report,
      });
    }
  );

  // Export data
  static exportData = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { dataType, format = "json" } = req.query;
      const { schoolId, startDate, endDate } = req.query;

      const filters: any = {};

      if (schoolId) {
        filters.schoolId = schoolId as string;
      }

      if (startDate && endDate) {
        filters.dateRange = {
          start: new Date(startDate as string),
          end: new Date(endDate as string),
        };
      }

      const exportData = await AdminService.exportData(
        dataType as "users" | "buses" | "students" | "trips" | "alerts",
        format as "csv" | "json" | "xlsx",
        filters
      );

      // Set appropriate headers based on format
      if (format === "json") {
        res.setHeader("Content-Type", "application/json");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${exportData.filename}"`
        );
        res.status(200).json(exportData.data);
      } else if (format === "csv") {
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${exportData.filename}"`
        );

        // Convert to CSV (simplified implementation)
        const csvData = AdminController.convertToCSV(exportData.data);
        res.status(200).send(csvData);
      } else {
        // For XLSX, would need a library like exceljs
        res.status(501).json({
          success: false,
          message: "XLSX export not implemented yet",
        });
      }
    }
  );

  // Run system maintenance
  static runSystemMaintenance = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const result = await AdminService.runSystemMaintenance();

      res.status(200).json({
        success: true,
        message: "System maintenance completed successfully",
        data: result,
      });
    }
  );

  // Get system settings
  static getSystemSettings = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const settings = await AdminService.getSystemSettings();

      res.status(200).json({
        success: true,
        data: settings,
      });
    }
  );

  // Update system settings
  static updateSystemSettings = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const settings = req.body;

      const updatedSettings = await AdminService.updateSystemSettings(settings);

      res.status(200).json({
        success: true,
        message: "System settings updated successfully",
        data: updatedSettings,
      });
    }
  );

  // User management functions
  static getAllUsers = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<PaginatedResponse<any>>
    ): Promise<void> => {
      const {
        page = 1,
        limit = 20,
        role,
        isActive,
        search,
        schoolId,
      } = req.query;

      const where: any = {};

      if (role) {
        where.role = role as string;
      }

      if (isActive !== undefined) {
        where.isActive = isActive === "true";
      }

      if (search) {
        where.OR = [
          { firstName: { contains: search as string, mode: "insensitive" } },
          { lastName: { contains: search as string, mode: "insensitive" } },
          { email: { contains: search as string, mode: "insensitive" } },
        ];
      }

      if (schoolId) {
        where.schoolStaff = {
          schoolId: schoolId as string,
        };
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          include: {
            schoolStaff: {
              include: {
                school: true,
              },
            },
            driver: {
              include: {
                bus: true,
              },
            },
            parent: {
              include: {
                students: {
                  include: {
                    school: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip: (parseInt(page as string) - 1) * parseInt(limit as string),
          take: parseInt(limit as string),
        }),
        prisma.user.count({ where }),
      ]);

      const totalPages = Math.ceil(total / parseInt(limit as string));

      res.status(200).json({
        success: true,
        data: users,
        meta: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages,
        },
      });
    }
  );

  // Update user
  static updateUser = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { userId } = req.params;
      const updateData = req.body;

      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        include: {
          schoolStaff: {
            include: {
              school: true,
            },
          },
          driver: {
            include: {
              bus: true,
            },
          },
          parent: {
            include: {
              students: {
                include: {
                  school: true,
                },
              },
            },
          },
        },
      });

      res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: user,
      });
    }
  );

  // Deactivate user
  static deactivateUser = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { userId } = req.params;

      await prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
      });

      res.status(200).json({
        success: true,
        message: "User deactivated successfully",
      });
    }
  );

  // Reactivate user
  static reactivateUser = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { userId } = req.params;

      await prisma.user.update({
        where: { id: userId },
        data: { isActive: true },
      });

      res.status(200).json({
        success: true,
        message: "User reactivated successfully",
      });
    }
  );

  // Get all buses
  static getAllBuses = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<PaginatedResponse<any>>
    ): Promise<void> => {
      const { page = 1, limit = 20, schoolId, isActive, search } = req.query;

      const where: any = {};

      if (schoolId) {
        where.schoolId = schoolId as string;
      }

      if (isActive !== undefined) {
        where.isActive = isActive === "true";
      }

      if (search) {
        where.OR = [
          { plateNumber: { contains: search as string, mode: "insensitive" } },
          { model: { contains: search as string, mode: "insensitive" } },
        ];
      }

      const [buses, total] = await Promise.all([
        prisma.bus.findMany({
          where,
          include: {
            driver: {
              include: {
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
            school: true,
            routes: {
              include: {
                stops: true,
              },
            },
            geofences: true,
            emergencyAlerts: {
              where: { resolved: false },
              select: {
                id: true,
                type: true,
                severity: true,
                createdAt: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip: (parseInt(page as string) - 1) * parseInt(limit as string),
          take: parseInt(limit as string),
        }),
        prisma.bus.count({ where }),
      ]);

      const totalPages = Math.ceil(total / parseInt(limit as string));

      res.status(200).json({
        success: true,
        data: buses,
        meta: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages,
        },
      });
    }
  );

  // Get all schools
  static getAllSchools = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<PaginatedResponse<any>>
    ): Promise<void> => {
      const { page = 1, limit = 20, search } = req.query;

      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: "insensitive" } },
          { address: { contains: search as string, mode: "insensitive" } },
        ];
      }

      const [schools, total] = await Promise.all([
        prisma.school.findMany({
          where,
          include: {
            _count: {
              select: {
                buses: true,
                students: true,
                staff: true,
              },
            },
          },
          orderBy: { name: "asc" },
          skip: (parseInt(page as string) - 1) * parseInt(limit as string),
          take: parseInt(limit as string),
        }),
        prisma.school.count({ where }),
      ]);

      const totalPages = Math.ceil(total / parseInt(limit as string));

      res.status(200).json({
        success: true,
        data: schools,
        meta: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages,
        },
      });
    }
  );

  // Get system logs (placeholder)
  static getSystemLogs = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<PaginatedResponse<any>>
    ): Promise<void> => {
      const { page = 1, limit = 50, level, startDate, endDate } = req.query;

      // This would integrate with a logging system like Winston, Morgan, etc.
      // For now, return placeholder data
      const logs = [
        {
          id: "1",
          level: "info",
          message: "User login successful",
          timestamp: new Date(),
          userId: "user123",
          ip: "192.168.1.1",
        },
        {
          id: "2",
          level: "warning",
          message: "Geofence violation detected",
          timestamp: new Date(Date.now() - 3600000),
          busId: "bus456",
          details: "Bus exited designated area",
        },
      ];

      res.status(200).json({
        success: true,
        data: logs,
        meta: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: logs.length,
          totalPages: 1,
        },
      });
    }
  );

  // Helper method to convert data to CSV
  private static convertToCSV(data: any[]): string {
    if (data.length === 0) return "";

    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Add headers
    csvRows.push(headers.join(","));

    // Add data rows
    for (const row of data) {
      const values = headers.map((header) => {
        const value = row[header];
        // Handle nested objects and arrays
        if (typeof value === "object" && value !== null) {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        // Escape quotes and wrap in quotes if contains comma or quote
        const stringValue = String(value || "");
        if (
          stringValue.includes(",") ||
          stringValue.includes('"') ||
          stringValue.includes("\n")
        ) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      });
      csvRows.push(values.join(","));
    }

    return csvRows.join("\n");
  }

  // School management methods
  static createSchool = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const schoolData: CreateSchoolData = req.body;

      const school = await AdminService.createSchool(schoolData);

      res.status(201).json({
        success: true,
        message: "School created successfully",
        data: school,
      });
    }
  );

  static updateSchool = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { id } = req.params;
      const schoolData: UpdateSchoolData = req.body;

      const school = await AdminService.updateSchool(id, schoolData);

      res.status(200).json({
        success: true,
        message: "School updated successfully",
        data: school,
      });
    }
  );

  static deleteSchool = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { id } = req.params;

      await AdminService.deleteSchool(id);

      res.status(200).json({
        success: true,
        message: "School deleted successfully",
      });
    }
  );

  static getSchoolById = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { id } = req.params;

      const school = await AdminService.getSchoolById(id);

      res.status(200).json({
        success: true,
        data: school,
      });
    }
  );

  // Get student analytics
  static getStudentAnalytics = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      // For now, return mock data
      const mockAnalytics = {
        totalStudents: 0,
        activeStudents: 0,
        studentsByGrade: [],
        studentsWithTags: 0,
        studentsWithoutTags: 0,
        recentEnrollments: 0,
        attendanceRate: 0,
        studentsBySchool: [],
      };

      res.status(200).json({
        success: true,
        data: mockAnalytics,
      });
    }
  );
}
