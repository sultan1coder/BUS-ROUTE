"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const adminService_1 = require("../services/adminService");
const errorHandler_1 = require("../middleware/errorHandler");
const database_1 = __importDefault(require("../config/database"));
class AdminController {
    // Helper method to convert data to CSV
    static convertToCSV(data) {
        if (data.length === 0)
            return "";
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
                if (stringValue.includes(",") ||
                    stringValue.includes('"') ||
                    stringValue.includes("\n")) {
                    return `"${stringValue.replace(/"/g, '""')}"`;
                }
                return stringValue;
            });
            csvRows.push(values.join(","));
        }
        return csvRows.join("\n");
    }
}
exports.AdminController = AdminController;
_a = AdminController;
// Get system overview
AdminController.getSystemOverview = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const overview = await adminService_1.AdminService.getSystemOverview();
    res.status(200).json({
        success: true,
        data: overview,
    });
});
// Get complete dashboard data
AdminController.getDashboard = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { schoolId, startDate, endDate } = req.query;
    const filters = {};
    if (schoolId) {
        filters.schoolId = schoolId;
    }
    if (startDate && endDate) {
        filters.dateRange = {
            start: new Date(startDate),
            end: new Date(endDate),
        };
    }
    const dashboardData = await adminService_1.AdminService.getDashboardData(filters);
    res.status(200).json({
        success: true,
        data: dashboardData,
    });
});
// Get user analytics
AdminController.getUserAnalytics = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { startDate, endDate } = req.query;
    const dateRange = startDate && endDate
        ? {
            start: new Date(startDate),
            end: new Date(endDate),
        }
        : undefined;
    const analytics = await adminService_1.AdminService.getUserAnalytics(dateRange);
    res.status(200).json({
        success: true,
        data: analytics,
    });
});
// Get fleet analytics
AdminController.getFleetAnalytics = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { startDate, endDate } = req.query;
    const dateRange = startDate && endDate
        ? {
            start: new Date(startDate),
            end: new Date(endDate),
        }
        : undefined;
    const analytics = await adminService_1.AdminService.getFleetAnalytics(dateRange);
    res.status(200).json({
        success: true,
        data: analytics,
    });
});
// Get safety analytics
AdminController.getSafetyAnalytics = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { startDate, endDate } = req.query;
    const dateRange = startDate && endDate
        ? {
            start: new Date(startDate),
            end: new Date(endDate),
        }
        : undefined;
    const analytics = await adminService_1.AdminService.getSafetyAnalytics(dateRange);
    res.status(200).json({
        success: true,
        data: analytics,
    });
});
// Get communication analytics
AdminController.getCommunicationAnalytics = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { startDate, endDate } = req.query;
    const dateRange = startDate && endDate
        ? {
            start: new Date(startDate),
            end: new Date(endDate),
        }
        : undefined;
    const analytics = await adminService_1.AdminService.getCommunicationAnalytics(dateRange);
    res.status(200).json({
        success: true,
        data: analytics,
    });
});
// Get performance metrics
AdminController.getPerformanceMetrics = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const metrics = await adminService_1.AdminService.getPerformanceMetrics();
    res.status(200).json({
        success: true,
        data: metrics,
    });
});
// Get recent activities
AdminController.getRecentActivities = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { limit = 20 } = req.query;
    const activities = await adminService_1.AdminService.getRecentActivities(parseInt(limit));
    res.status(200).json({
        success: true,
        data: activities,
        meta: {
            page: 1,
            limit: parseInt(limit),
            total: activities.length,
            totalPages: 1,
        },
    });
});
// Get detailed reports
AdminController.getDetailedReport = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { reportType } = req.params;
    const { schoolId, startDate, endDate, groupBy } = req.query;
    const filters = {};
    if (schoolId) {
        filters.schoolId = schoolId;
    }
    if (startDate && endDate) {
        filters.dateRange = {
            start: new Date(startDate),
            end: new Date(endDate),
        };
    }
    if (groupBy) {
        filters.groupBy = groupBy;
    }
    const report = await adminService_1.AdminService.getDetailedReport(reportType, filters);
    res.status(200).json({
        success: true,
        data: report,
    });
});
// Export data
AdminController.exportData = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { dataType, format = "json" } = req.query;
    const { schoolId, startDate, endDate } = req.query;
    const filters = {};
    if (schoolId) {
        filters.schoolId = schoolId;
    }
    if (startDate && endDate) {
        filters.dateRange = {
            start: new Date(startDate),
            end: new Date(endDate),
        };
    }
    const exportData = await adminService_1.AdminService.exportData(dataType, format, filters);
    // Set appropriate headers based on format
    if (format === "json") {
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", `attachment; filename="${exportData.filename}"`);
        res.status(200).json(exportData.data);
    }
    else if (format === "csv") {
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="${exportData.filename}"`);
        // Convert to CSV (simplified implementation)
        const csvData = _a.convertToCSV(exportData.data);
        res.status(200).send(csvData);
    }
    else {
        // For XLSX, would need a library like exceljs
        res.status(501).json({
            success: false,
            message: "XLSX export not implemented yet",
        });
    }
});
// Run system maintenance
AdminController.runSystemMaintenance = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await adminService_1.AdminService.runSystemMaintenance();
    res.status(200).json({
        success: true,
        message: "System maintenance completed successfully",
        data: result,
    });
});
// Get system settings
AdminController.getSystemSettings = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const settings = await adminService_1.AdminService.getSystemSettings();
    res.status(200).json({
        success: true,
        data: settings,
    });
});
// Update system settings
AdminController.updateSystemSettings = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const settings = req.body;
    const updatedSettings = await adminService_1.AdminService.updateSystemSettings(settings);
    res.status(200).json({
        success: true,
        message: "System settings updated successfully",
        data: updatedSettings,
    });
});
// User management functions
AdminController.getAllUsers = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 20, role, isActive, search, schoolId, } = req.query;
    const where = {};
    if (role) {
        where.role = role;
    }
    if (isActive !== undefined) {
        where.isActive = isActive === "true";
    }
    if (search) {
        where.OR = [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
        ];
    }
    if (schoolId) {
        where.schoolStaff = {
            schoolId: schoolId,
        };
    }
    const [users, total] = await Promise.all([
        database_1.default.user.findMany({
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
            skip: (parseInt(page) - 1) * parseInt(limit),
            take: parseInt(limit),
        }),
        database_1.default.user.count({ where }),
    ]);
    const totalPages = Math.ceil(total / parseInt(limit));
    res.status(200).json({
        success: true,
        data: users,
        meta: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages,
        },
    });
});
// Update user
AdminController.updateUser = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.params;
    const updateData = req.body;
    const user = await database_1.default.user.update({
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
});
// Deactivate user
AdminController.deactivateUser = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.params;
    await database_1.default.user.update({
        where: { id: userId },
        data: { isActive: false },
    });
    res.status(200).json({
        success: true,
        message: "User deactivated successfully",
    });
});
// Reactivate user
AdminController.reactivateUser = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.params;
    await database_1.default.user.update({
        where: { id: userId },
        data: { isActive: true },
    });
    res.status(200).json({
        success: true,
        message: "User reactivated successfully",
    });
});
// Get all buses
AdminController.getAllBuses = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 20, schoolId, isActive, search } = req.query;
    const where = {};
    if (schoolId) {
        where.schoolId = schoolId;
    }
    if (isActive !== undefined) {
        where.isActive = isActive === "true";
    }
    if (search) {
        where.OR = [
            { plateNumber: { contains: search, mode: "insensitive" } },
            { model: { contains: search, mode: "insensitive" } },
        ];
    }
    const [buses, total] = await Promise.all([
        database_1.default.bus.findMany({
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
            skip: (parseInt(page) - 1) * parseInt(limit),
            take: parseInt(limit),
        }),
        database_1.default.bus.count({ where }),
    ]);
    const totalPages = Math.ceil(total / parseInt(limit));
    res.status(200).json({
        success: true,
        data: buses,
        meta: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages,
        },
    });
});
// Get all schools
AdminController.getAllSchools = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 20, search } = req.query;
    const where = {};
    if (search) {
        where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { address: { contains: search, mode: "insensitive" } },
        ];
    }
    const [schools, total] = await Promise.all([
        database_1.default.school.findMany({
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
            skip: (parseInt(page) - 1) * parseInt(limit),
            take: parseInt(limit),
        }),
        database_1.default.school.count({ where }),
    ]);
    const totalPages = Math.ceil(total / parseInt(limit));
    res.status(200).json({
        success: true,
        data: schools,
        meta: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages,
        },
    });
});
// Get system logs (placeholder)
AdminController.getSystemLogs = (0, errorHandler_1.asyncHandler)(async (req, res) => {
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
            page: parseInt(page),
            limit: parseInt(limit),
            total: logs.length,
            totalPages: 1,
        },
    });
});
// School management methods
AdminController.createSchool = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const schoolData = req.body;
    const school = await adminService_1.AdminService.createSchool(schoolData);
    res.status(201).json({
        success: true,
        message: "School created successfully",
        data: school,
    });
});
AdminController.updateSchool = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const schoolData = req.body;
    const school = await adminService_1.AdminService.updateSchool(id, schoolData);
    res.status(200).json({
        success: true,
        message: "School updated successfully",
        data: school,
    });
});
AdminController.deleteSchool = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    await adminService_1.AdminService.deleteSchool(id);
    res.status(200).json({
        success: true,
        message: "School deleted successfully",
    });
});
AdminController.getSchoolById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const school = await adminService_1.AdminService.getSchoolById(id);
    res.status(200).json({
        success: true,
        data: school,
    });
});
//# sourceMappingURL=adminController.js.map