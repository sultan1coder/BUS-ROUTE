"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ETASpeedController = void 0;
const etaSpeedService_1 = require("../services/etaSpeedService");
const errorHandler_1 = require("../middleware/errorHandler");
const database_1 = __importDefault(require("../config/database"));
class ETASpeedController {
}
exports.ETASpeedController = ETASpeedController;
_a = ETASpeedController;
// Calculate ETA for a bus
ETASpeedController.calculateETA = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { busId } = req.params;
    const eta = await etaSpeedService_1.ETASpeedService.calculateETA(busId);
    res.status(200).json({
        success: true,
        data: eta,
    });
});
// Monitor speed and check for violations
ETASpeedController.monitorSpeed = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { busId } = req.params;
    const { currentSpeed, latitude, longitude } = req.body;
    if (typeof currentSpeed !== "number" ||
        typeof latitude !== "number" ||
        typeof longitude !== "number") {
        res.status(400).json({
            success: false,
            message: "currentSpeed, latitude, and longitude are required and must be numbers",
        });
        return;
    }
    const violation = await etaSpeedService_1.ETASpeedService.monitorSpeed(busId, currentSpeed, { latitude, longitude });
    res.status(200).json({
        success: true,
        data: violation,
        message: violation
            ? "Speed violation detected and recorded"
            : "Speed within limits",
    });
});
// Analyze ETA performance
ETASpeedController.analyzeETA = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { busId } = req.params;
    const analysis = await etaSpeedService_1.ETASpeedService.analyzeETA(busId);
    res.status(200).json({
        success: true,
        data: analysis,
    });
});
// Get speed analytics for a bus
ETASpeedController.getSpeedAnalytics = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { busId } = req.params;
    const { startDate, endDate } = req.query;
    const analytics = await etaSpeedService_1.ETASpeedService.getSpeedAnalytics(busId, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
    res.status(200).json({
        success: true,
        data: analytics,
    });
});
// Get fleet-wide speed statistics
ETASpeedController.getFleetSpeedStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { schoolId } = req.query;
    const stats = await etaSpeedService_1.ETASpeedService.getFleetSpeedStats(schoolId);
    res.status(200).json({
        success: true,
        data: stats,
    });
});
// Predict ETA based on historical data
ETASpeedController.predictETA = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { busId } = req.params;
    const { stopId } = req.query;
    if (!stopId) {
        res.status(400).json({
            success: false,
            message: "stopId parameter is required",
        });
        return;
    }
    const prediction = await etaSpeedService_1.ETASpeedService.predictETA(busId, stopId);
    res.status(200).json({
        success: true,
        data: prediction,
    });
});
// Get speed violations for a bus
ETASpeedController.getSpeedViolations = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { busId } = req.params;
    const { startDate, endDate, severity, page = 1, limit = 20 } = req.query;
    const where = { busId };
    if (startDate || endDate) {
        where.timestamp = {};
        if (startDate)
            where.timestamp.gte = new Date(startDate);
        if (endDate)
            where.timestamp.lte = new Date(endDate);
    }
    if (severity) {
        where.severity = severity;
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [violations, total] = await Promise.all([
        database_1.default.speedViolation.findMany({
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
            take: parseInt(limit),
        }),
        database_1.default.speedViolation.count({ where }),
    ]);
    const totalPages = Math.ceil(total / parseInt(limit));
    res.status(200).json({
        success: true,
        data: violations,
        meta: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages,
        },
    });
});
// Get ETA alerts for delayed buses
ETASpeedController.getETAAllerts = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { schoolId } = req.query;
    // Get all active buses for the school
    const where = { isActive: true };
    if (schoolId) {
        where.schoolId = schoolId;
    }
    const buses = await database_1.default.bus.findMany({
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
    const alerts = [];
    for (const bus of buses) {
        try {
            const analysis = await etaSpeedService_1.ETASpeedService.analyzeETA(bus.id);
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
        }
        catch (error) {
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
});
// Bulk speed monitoring (for GPS devices)
ETASpeedController.bulkSpeedMonitoring = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { readings } = req.body;
    if (!Array.isArray(readings)) {
        res.status(400).json({
            success: false,
            message: "readings must be an array",
        });
        return;
    }
    const results = [];
    let violationsCount = 0;
    for (const reading of readings) {
        const { busId, speed, latitude, longitude } = reading;
        try {
            const violation = await etaSpeedService_1.ETASpeedService.monitorSpeed(busId, speed, {
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
        }
        catch (error) {
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
});
// Get speed violation statistics
ETASpeedController.getSpeedViolationStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { schoolId, startDate, endDate } = req.query;
    const where = {};
    if (schoolId) {
        where.bus = { schoolId };
    }
    if (startDate || endDate) {
        where.timestamp = {};
        if (startDate)
            where.timestamp.gte = new Date(startDate);
        if (endDate)
            where.timestamp.lte = new Date(endDate);
    }
    const [totalViolations, violationsBySeverity, violationsByBus, recentViolations,] = await Promise.all([
        database_1.default.speedViolation.count({ where }),
        database_1.default.speedViolation.groupBy({
            by: ["severity"],
            where,
            _count: true,
        }),
        database_1.default.speedViolation.groupBy({
            by: ["busId"],
            where,
            _count: true,
            orderBy: { _count: { busId: "desc" } },
            take: 10,
        }),
        database_1.default.speedViolation.findMany({
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
    const busDetails = await Promise.all(violationsByBus.map(async (item) => {
        const bus = await database_1.default.bus.findUnique({
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
    }));
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
            }, {}),
            topViolatingBuses: busDetails,
            recentViolations,
        },
    });
});
//# sourceMappingURL=etaSpeedController.js.map