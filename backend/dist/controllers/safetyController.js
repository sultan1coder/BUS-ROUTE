"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafetyController = void 0;
const safetyService_1 = require("../services/safetyService");
const errorHandler_1 = require("../middleware/errorHandler");
const database_1 = __importDefault(require("../config/database"));
class SafetyController {
}
exports.SafetyController = SafetyController;
_a = SafetyController;
// Trigger SOS alert
SafetyController.triggerSOS = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    const alertData = req.body;
    if (!userId) {
        res.status(401).json({
            success: false,
            message: "User not authenticated",
        });
        return;
    }
    const alert = await safetyService_1.SafetyService.triggerSOSAlert(userId, alertData);
    res.status(201).json({
        success: true,
        message: "SOS alert triggered successfully",
        data: alert,
    });
});
// Create geofence
SafetyController.createGeofence = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const geofenceData = req.body;
    const geofence = await safetyService_1.SafetyService.createGeofence(geofenceData);
    res.status(201).json({
        success: true,
        message: "Geofence created successfully",
        data: geofence,
    });
});
// Get geofences for a bus
SafetyController.getBusGeofences = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { busId } = req.params;
    const geofences = await safetyService_1.SafetyService.getBusGeofences(busId);
    res.status(200).json({
        success: true,
        data: geofences,
    });
});
// Update geofence
SafetyController.updateGeofence = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { geofenceId } = req.params;
    const updates = req.body;
    const geofence = await safetyService_1.SafetyService.updateGeofence(geofenceId, updates);
    res.status(200).json({
        success: true,
        message: "Geofence updated successfully",
        data: geofence,
    });
});
// Delete geofence
SafetyController.deleteGeofence = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { geofenceId } = req.params;
    const success = await safetyService_1.SafetyService.deleteGeofence(geofenceId);
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
});
// Check geofence violation (called by GPS tracking system)
SafetyController.checkGeofenceViolation = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { busId, latitude, longitude } = req.body;
    if (!busId || latitude === undefined || longitude === undefined) {
        res.status(400).json({
            success: false,
            message: "Bus ID, latitude, and longitude are required",
        });
        return;
    }
    const result = await safetyService_1.SafetyService.checkGeofenceViolation(busId, parseFloat(latitude), parseFloat(longitude));
    if (result.violated && result.geofence) {
        // Handle the violation
        await safetyService_1.SafetyService.handleGeofenceViolation(busId, result.geofence, result.action, { latitude: parseFloat(latitude), longitude: parseFloat(longitude) });
    }
    res.status(200).json({
        success: true,
        data: result,
    });
});
// Report speed violation
SafetyController.reportSpeedViolation = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const speedData = req.body;
    await safetyService_1.SafetyService.monitorSpeedViolation(speedData);
    res.status(201).json({
        success: true,
        message: "Speed violation reported successfully",
    });
});
// Get active alerts
SafetyController.getActiveAlerts = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { busId, driverId, type, severity, page = 1, limit = 20, } = req.query;
    const filters = {};
    if (busId)
        filters.busId = busId;
    if (driverId)
        filters.driverId = driverId;
    if (type)
        filters.type = type;
    if (severity)
        filters.severity = severity;
    const alerts = await safetyService_1.SafetyService.getActiveAlerts(filters);
    // Apply pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedAlerts = alerts.slice(startIndex, endIndex);
    const totalPages = Math.ceil(alerts.length / parseInt(limit));
    res.status(200).json({
        success: true,
        data: paginatedAlerts,
        meta: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: alerts.length,
            totalPages,
        },
    });
});
// Resolve alert
SafetyController.resolveAlert = (0, errorHandler_1.asyncHandler)(async (req, res) => {
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
    const alert = await safetyService_1.SafetyService.resolveAlert(alertId, resolvedBy, resolutionNotes);
    res.status(200).json({
        success: true,
        message: "Alert resolved successfully",
        data: alert,
    });
});
// Get safety report
SafetyController.getSafetyReport = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { schoolId, startDate, endDate } = req.query;
    const dateRange = startDate && endDate
        ? {
            start: new Date(startDate),
            end: new Date(endDate),
        }
        : undefined;
    const report = await safetyService_1.SafetyService.getSafetyReport(schoolId, dateRange);
    res.status(200).json({
        success: true,
        data: report,
    });
});
// Get alert history
SafetyController.getAlertHistory = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { busId, driverId, type, resolved, startDate, endDate, page = 1, limit = 20, } = req.query;
    const filters = {};
    if (busId)
        filters.busId = busId;
    if (driverId)
        filters.driverId = driverId;
    if (type)
        filters.type = type;
    if (resolved !== undefined)
        filters.resolved = resolved === "true";
    if (startDate)
        filters.startDate = new Date(startDate);
    if (endDate)
        filters.endDate = new Date(endDate);
    const result = await safetyService_1.SafetyService.getAlertHistory(filters, parseInt(page), parseInt(limit));
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
});
// Get emergency contacts
SafetyController.getEmergencyContacts = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({
            success: false,
            message: "User not authenticated",
        });
        return;
    }
    const contacts = await safetyService_1.SafetyService.getEmergencyContacts(userId);
    res.status(200).json({
        success: true,
        data: contacts,
    });
});
// Send emergency SMS (admin only)
SafetyController.sendEmergencySMS = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { phoneNumber, message } = req.body;
    // Validate user role
    const user = await database_1.default.user.findUnique({
        where: { id: req.user?.id },
        select: { role: true },
    });
    if (!user || !["ADMIN", "SCHOOL_STAFF"].includes(user.role)) {
        res.status(403).json({
            success: false,
            message: "Only administrators and school staff can send emergency SMS",
        });
        return;
    }
    const success = await safetyService_1.SafetyService.sendEmergencySMS(phoneNumber, message);
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
});
// Get real-time safety status
SafetyController.getSafetyStatus = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({
            success: false,
            message: "User not authenticated",
        });
        return;
    }
    // Get active alerts count
    const activeAlertsCount = await database_1.default.emergencyAlert.count({
        where: { resolved: false },
    });
    // Get critical alerts
    const criticalAlerts = await database_1.default.emergencyAlert.findMany({
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
    const user = await database_1.default.user.findUnique({
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
});
// Bulk resolve alerts
SafetyController.bulkResolveAlerts = (0, errorHandler_1.asyncHandler)(async (req, res) => {
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
            const alert = await safetyService_1.SafetyService.resolveAlert(alertId, resolvedBy, resolutionNotes);
            results.push({ alertId, success: true, alert });
        }
        catch (error) {
            results.push({ alertId, success: false, error: error.message });
        }
    }
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;
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
});
// Get geofence statistics
SafetyController.getGeofenceStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { busId } = req.query;
    const where = {
        type: "GEOFENCE_VIOLATION",
    };
    if (busId) {
        where.busId = busId;
    }
    const [totalViolations, violationsToday, violationsThisWeek, violationsByBus,] = await Promise.all([
        database_1.default.emergencyAlert.count({ where }),
        database_1.default.emergencyAlert.count({
            where: {
                ...where,
                createdAt: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                },
            },
        }),
        database_1.default.emergencyAlert.count({
            where: {
                ...where,
                createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
            },
        }),
        database_1.default.emergencyAlert.groupBy({
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
            ? violationsByBus.map((item) => ({
                busId: item.busId,
                count: item._count,
            }))
            : [],
    };
    res.status(200).json({
        success: true,
        data: stats,
    });
});
// Get speed violation statistics
SafetyController.getSpeedViolationStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { busId, startDate, endDate } = req.query;
    const where = {
        type: "SPEED_VIOLATION",
    };
    if (busId) {
        where.busId = busId;
    }
    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate)
            where.createdAt.gte = new Date(startDate);
        if (endDate)
            where.createdAt.lte = new Date(endDate);
    }
    const [totalViolations, violationsBySeverity, violationsByBus, recentViolations,] = await Promise.all([
        database_1.default.emergencyAlert.count({ where }),
        database_1.default.emergencyAlert.groupBy({
            by: ["severity"],
            where,
            _count: true,
        }),
        database_1.default.emergencyAlert.groupBy({
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
        database_1.default.emergencyAlert.findMany({
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
            ? violationsByBus.map((item) => ({
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
});
// Cleanup old alerts (admin only)
SafetyController.cleanupAlerts = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { daysToKeep = 365 } = req.query;
    const deletedCount = await safetyService_1.SafetyService.cleanupOldAlerts(parseInt(daysToKeep));
    res.status(200).json({
        success: true,
        message: `Cleaned up ${deletedCount} old alerts`,
        data: { deletedCount },
    });
});
//# sourceMappingURL=safetyController.js.map