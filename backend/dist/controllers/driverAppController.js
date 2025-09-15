"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverAppController = void 0;
const driverAppService_1 = require("../services/driverAppService");
const errorHandler_1 = require("../middleware/errorHandler");
const database_1 = __importDefault(require("../config/database"));
class DriverAppController {
}
exports.DriverAppController = DriverAppController;
_a = DriverAppController;
// Get driver dashboard
DriverAppController.getDashboard = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const driverId = req.user?.id;
    if (!driverId) {
        res.status(401).json({
            success: false,
            message: "User not authenticated",
        });
        return;
    }
    const dashboard = await driverAppService_1.DriverAppService.getDriverDashboard(driverId);
    res.status(200).json({
        success: true,
        data: dashboard,
    });
});
// Start a trip
DriverAppController.startTrip = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const driverId = req.user?.id;
    const tripData = req.body;
    if (!driverId) {
        res.status(401).json({
            success: false,
            message: "User not authenticated",
        });
        return;
    }
    const trip = await driverAppService_1.DriverAppService.startTrip(driverId, tripData);
    res.status(201).json({
        success: true,
        message: "Trip started successfully",
        data: trip,
    });
});
// Update trip status
DriverAppController.updateTrip = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const driverId = req.user?.id;
    const { tripId } = req.params;
    const updateData = req.body;
    if (!driverId) {
        res.status(401).json({
            success: false,
            message: "User not authenticated",
        });
        return;
    }
    const trip = await driverAppService_1.DriverAppService.updateTrip(driverId, tripId, updateData);
    res.status(200).json({
        success: true,
        message: "Trip updated successfully",
        data: trip,
    });
});
// Get current trip
DriverAppController.getCurrentTrip = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const driverId = req.user?.id;
    if (!driverId) {
        res.status(401).json({
            success: false,
            message: "User not authenticated",
        });
        return;
    }
    const trip = await driverAppService_1.DriverAppService.getCurrentTrip(driverId);
    res.status(200).json({
        success: true,
        data: trip,
    });
});
// Get trip navigation data
DriverAppController.getTripNavigation = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const driverId = req.user?.id;
    const navigationData = req.body;
    if (!driverId) {
        res.status(401).json({
            success: false,
            message: "User not authenticated",
        });
        return;
    }
    const navigation = await driverAppService_1.DriverAppService.getTripNavigation(driverId, navigationData);
    res.status(200).json({
        success: true,
        data: navigation,
    });
});
// Record student pickup
DriverAppController.recordStudentPickup = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const driverId = req.user?.id;
    const { tripId } = req.params;
    const pickupData = req.body;
    if (!driverId) {
        res.status(401).json({
            success: false,
            message: "User not authenticated",
        });
        return;
    }
    const attendance = await driverAppService_1.DriverAppService.recordStudentPickup(driverId, tripId, pickupData);
    res.status(201).json({
        success: true,
        message: "Student pickup recorded successfully",
        data: attendance,
    });
});
// Record student drop-off
DriverAppController.recordStudentDrop = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const driverId = req.user?.id;
    const { tripId } = req.params;
    const dropData = req.body;
    if (!driverId) {
        res.status(401).json({
            success: false,
            message: "User not authenticated",
        });
        return;
    }
    const attendance = await driverAppService_1.DriverAppService.recordStudentDrop(driverId, tripId, dropData);
    res.status(201).json({
        success: true,
        message: "Student drop-off recorded successfully",
        data: attendance,
    });
});
// Get student manifest for trip
DriverAppController.getStudentManifest = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const driverId = req.user?.id;
    const { tripId } = req.params;
    if (!driverId) {
        res.status(401).json({
            success: false,
            message: "User not authenticated",
        });
        return;
    }
    const manifest = await driverAppService_1.DriverAppService.getStudentManifest(driverId, tripId);
    res.status(200).json({
        success: true,
        data: manifest,
    });
});
// Update driver location
DriverAppController.updateLocation = (0, errorHandler_1.asyncHandler)(async (req, res) => {
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
    await driverAppService_1.DriverAppService.updateDriverLocation(driverId, {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
    }, {
        speed: speed ? parseFloat(speed) : undefined,
        heading: heading ? parseFloat(heading) : undefined,
        accuracy: accuracy ? parseFloat(accuracy) : undefined,
    });
    res.status(200).json({
        success: true,
        message: "Location updated successfully",
    });
});
// Get driver's assigned routes
DriverAppController.getRoutes = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const driverId = req.user?.id;
    if (!driverId) {
        res.status(401).json({
            success: false,
            message: "User not authenticated",
        });
        return;
    }
    const routes = await driverAppService_1.DriverAppService.getDriverRoutes(driverId);
    res.status(200).json({
        success: true,
        data: routes,
    });
});
// Get trip history
DriverAppController.getTripHistory = (0, errorHandler_1.asyncHandler)(async (req, res) => {
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
    const filters = {};
    if (startDate)
        filters.startDate = new Date(startDate);
    if (endDate)
        filters.endDate = new Date(endDate);
    if (status)
        filters.status = status;
    const result = await driverAppService_1.DriverAppService.getDriverTripHistory(driverId, parseInt(page), parseInt(limit), filters);
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
});
// Get driver report/earnings
DriverAppController.getReport = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const driverId = req.user?.id;
    const { period = "monthly" } = req.query;
    if (!driverId) {
        res.status(401).json({
            success: false,
            message: "User not authenticated",
        });
        return;
    }
    const report = await driverAppService_1.DriverAppService.getDriverReport(driverId, period);
    res.status(200).json({
        success: true,
        data: report,
    });
});
// Trigger emergency from driver app
DriverAppController.triggerEmergency = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const driverId = req.user?.id;
    const emergencyData = req.body;
    if (!driverId) {
        res.status(401).json({
            success: false,
            message: "User not authenticated",
        });
        return;
    }
    const alert = await driverAppService_1.DriverAppService.triggerDriverEmergency(driverId, emergencyData);
    res.status(201).json({
        success: true,
        message: "Emergency alert triggered successfully",
        data: alert,
    });
});
// Update driver status
DriverAppController.updateDriverStatus = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const driverId = req.user?.id;
    const { isOnline, status, currentLocation } = req.body;
    if (!driverId) {
        res.status(401).json({
            success: false,
            message: "User not authenticated",
        });
        return;
    }
    await driverAppService_1.DriverAppService.updateDriverStatus(driverId, {
        isOnline,
        status,
        currentLocation,
    });
    res.status(200).json({
        success: true,
        message: "Driver status updated successfully",
    });
});
// Get route details with stops and students
DriverAppController.getRouteDetails = (0, errorHandler_1.asyncHandler)(async (req, res) => {
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
    const route = await database_1.default.route.findFirst({
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
});
// Get stop details with student list
DriverAppController.getStopDetails = (0, errorHandler_1.asyncHandler)(async (req, res) => {
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
    const stop = await database_1.default.routeStop.findFirst({
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
});
// Get trip summary
DriverAppController.getTripSummary = (0, errorHandler_1.asyncHandler)(async (req, res) => {
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
    const trip = await database_1.default.trip.findFirst({
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
        pickedUpStudents: trip.attendance.filter((a) => a.action === "pickup").length,
        droppedOffStudents: trip.attendance.filter((a) => a.action === "drop").length,
        duration: trip.actualStart && trip.actualEnd
            ? Math.round((trip.actualEnd.getTime() - trip.actualStart.getTime()) /
                (1000 * 60))
            : null,
        issues: [], // Would track any issues during the trip
    };
    res.status(200).json({
        success: true,
        data: summary,
    });
});
// Quick attendance check for a student
DriverAppController.quickAttendanceCheck = (0, errorHandler_1.asyncHandler)(async (req, res) => {
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
    const trip = await database_1.default.trip.findFirst({
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
    const attendance = await database_1.default.attendance.findFirst({
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
});
// Get driver notifications/alerts
DriverAppController.getNotifications = (0, errorHandler_1.asyncHandler)(async (req, res) => {
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
    const where = { recipientId: driverId };
    if (unreadOnly === "true") {
        where.isRead = false;
    }
    const [notifications, total] = await Promise.all([
        database_1.default.notification.findMany({
            where,
            orderBy: { sentAt: "desc" },
            skip: (parseInt(page) - 1) * parseInt(limit),
            take: parseInt(limit),
        }),
        database_1.default.notification.count({ where }),
    ]);
    const totalPages = Math.ceil(total / parseInt(limit));
    res.status(200).json({
        success: true,
        data: notifications,
        meta: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages,
        },
    });
});
// Mark notification as read
DriverAppController.markNotificationRead = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const driverId = req.user?.id;
    const { notificationId } = req.params;
    if (!driverId) {
        res.status(401).json({
            success: false,
            message: "User not authenticated",
        });
        return;
    }
    const result = await database_1.default.notification.updateMany({
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
});
// Get driver settings/preferences
DriverAppController.getDriverSettings = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const driverId = req.user?.id;
    if (!driverId) {
        res.status(401).json({
            success: false,
            message: "User not authenticated",
        });
        return;
    }
    // Get driver preferences (would be stored in a separate table in real implementation)
    const driver = await database_1.default.user.findUnique({
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
});
// Update driver settings
DriverAppController.updateDriverSettings = (0, errorHandler_1.asyncHandler)(async (req, res) => {
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
});
//# sourceMappingURL=driverAppController.js.map