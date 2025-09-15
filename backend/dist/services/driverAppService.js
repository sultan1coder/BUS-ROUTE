"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverAppService = void 0;
const database_1 = __importDefault(require("../config/database"));
const server_1 = require("../server");
const errorHandler_1 = require("../middleware/errorHandler");
const gpsTrackingService_1 = require("./gpsTrackingService");
const safetyService_1 = require("./safetyService");
class DriverAppService {
    // Start a trip
    static async startTrip(driverId, tripData) {
        const { routeId, scheduledStartTime, notes } = tripData;
        // Verify driver has access to this route/bus
        const driver = await database_1.default.driver.findUnique({
            where: { userId: driverId },
            include: {
                bus: {
                    include: {
                        routes: {
                            where: { id: routeId },
                        },
                    },
                },
            },
        });
        if (!driver || !driver.bus || driver.bus.routes.length === 0) {
            throw new errorHandler_1.CustomError("You don't have access to this route", 403);
        }
        // Check if there's already an active trip for this driver
        const activeTrip = await database_1.default.trip.findFirst({
            where: {
                driverId: driver.id,
                status: { in: ["IN_PROGRESS", "SCHEDULED"] },
            },
        });
        if (activeTrip) {
            throw new errorHandler_1.CustomError("You already have an active trip", 400);
        }
        // Create new trip
        const trip = await database_1.default.trip.create({
            data: {
                routeId,
                busId: driver.bus.id,
                driverId: driver.id,
                status: "IN_PROGRESS",
                actualStart: new Date(),
                scheduledStart: scheduledStartTime || new Date(),
                scheduledEnd: new Date(Date.now() + 2 * 60 * 60 * 1000), // Default 2 hours from start
                notes,
            },
            include: {
                route: {
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
                    },
                },
                bus: true,
                driver: {
                    include: {
                        user: true,
                    },
                },
            },
        });
        // Update driver status
        await this.updateDriverStatus(driverId, {
            isOnline: true,
            currentTripId: trip.id,
            status: "ON_TRIP",
        });
        // Emit real-time trip start event
        this.emitTripEvent("trip_started", {
            tripId: trip.id,
            driverId,
            busId: driver.bus.id,
            routeId,
            startTime: trip.actualStart,
        });
        return trip;
    }
    // Update trip status
    static async updateTrip(driverId, tripId, updateData) {
        const { status, currentLocation, notes } = updateData;
        // Verify driver owns this trip
        const trip = await database_1.default.trip.findFirst({
            where: {
                id: tripId,
                driver: {
                    userId: driverId,
                },
            },
        });
        if (!trip) {
            throw new errorHandler_1.CustomError("Trip not found or access denied", 404);
        }
        // Update trip
        const updatedTrip = await database_1.default.trip.update({
            where: { id: tripId },
            data: {
                status: status || trip.status,
                actualEnd: status === "COMPLETED" ? new Date() : undefined,
                notes: notes ? `${trip.notes || ""}\n${notes}` : trip.notes,
            },
            include: {
                route: true,
                bus: true,
                driver: {
                    include: {
                        user: true,
                    },
                },
            },
        });
        // If trip is completed, update driver status
        if (status === "COMPLETED") {
            await this.updateDriverStatus(driverId, {
                isOnline: true,
                status: "AVAILABLE",
            });
        }
        // Update location if provided
        if (currentLocation) {
            await gpsTrackingService_1.GPSTrackingService.recordLocation({
                busId: updatedTrip.busId,
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                speed: 0, // Would come from device
                heading: 0,
                accuracy: 10,
            });
        }
        // Emit real-time trip update
        this.emitTripEvent("trip_updated", {
            tripId,
            status: updatedTrip.status,
            driverId,
            location: currentLocation,
        });
        return updatedTrip;
    }
    // Get current trip for driver
    static async getCurrentTrip(driverId) {
        const trip = await database_1.default.trip.findFirst({
            where: {
                driver: {
                    userId: driverId,
                },
                status: "IN_PROGRESS",
            },
            include: {
                route: {
                    include: {
                        stops: {
                            include: {
                                assignments: {
                                    where: { isActive: true },
                                    include: {
                                        student: true,
                                    },
                                },
                                _count: {
                                    select: {
                                        assignments: true,
                                    },
                                },
                            },
                            orderBy: { sequence: "asc" },
                        },
                    },
                },
                bus: true,
                driver: {
                    include: {
                        user: true,
                    },
                },
                _count: {
                    select: {
                        attendance: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        return trip;
    }
    // Get trip navigation data
    static async getTripNavigation(driverId, navigationData) {
        const { routeId, currentLocation } = navigationData;
        // Get route details
        const route = await database_1.default.route.findUnique({
            where: { id: routeId },
            include: {
                stops: {
                    include: {
                        assignments: {
                            where: { isActive: true },
                            include: {
                                student: true,
                            },
                        },
                    },
                    orderBy: { sequence: "asc" },
                },
                bus: true,
            },
        });
        if (!route) {
            throw new errorHandler_1.CustomError("Route not found", 404);
        }
        // Calculate navigation data
        const navigation = {
            route: {
                id: route.id,
                name: route.name,
                totalDistance: null, // TODO: Calculate from GPS data
                estimatedDuration: null, // TODO: Calculate from stops
            },
            stops: route.stops.map((stop) => ({
                id: stop.id,
                name: stop.name,
                latitude: stop.latitude,
                longitude: stop.longitude,
                sequence: stop.sequence,
                pickupTime: stop.pickupTime,
                studentCount: stop.assignments.length,
                students: stop.assignments.map((assignment) => ({
                    id: assignment.student.id,
                    firstName: assignment.student.firstName,
                    lastName: assignment.student.lastName,
                    grade: assignment.student.grade,
                })),
            })),
            currentLocation,
            nextStop: this.calculateNextStop(route.stops, currentLocation),
            progress: this.calculateTripProgress(route.stops, currentLocation),
        };
        return navigation;
    }
    // Record student pickup
    static async recordStudentPickup(driverId, tripId, pickupData) {
        const { studentId, stopId, pickupTime, location } = pickupData;
        // Verify driver has access to this trip
        const trip = await database_1.default.trip.findFirst({
            where: {
                id: tripId,
                driver: {
                    userId: driverId,
                },
                status: "IN_PROGRESS",
            },
        });
        if (!trip) {
            throw new errorHandler_1.CustomError("Trip not found or access denied", 404);
        }
        // Record attendance manually
        const attendance = await database_1.default.attendance.upsert({
            where: {
                studentId_tripId: {
                    studentId,
                    tripId,
                },
            },
            update: {
                pickupTime: pickupTime || new Date(),
                status: "PRESENT",
                recordedBy: driverId,
            },
            create: {
                studentId,
                tripId,
                pickupTime: pickupTime || new Date(),
                status: "PRESENT",
                recordedBy: driverId,
            },
            include: {
                student: true,
            },
        });
        // Notify parents
        const { NotificationService } = await Promise.resolve().then(() => __importStar(require("./notificationService")));
        await NotificationService.notifyStudentPickup(studentId, trip.busId, tripId);
        // Emit real-time pickup event
        this.emitTripEvent("student_pickup", {
            tripId,
            studentId,
            stopId,
            pickupTime: attendance.pickupTime,
            location,
        });
        return attendance;
    }
    // Record student drop-off
    static async recordStudentDrop(driverId, tripId, dropData) {
        const { studentId, stopId, dropTime, location } = dropData;
        // Verify driver has access to this trip
        const trip = await database_1.default.trip.findFirst({
            where: {
                id: tripId,
                driver: {
                    userId: driverId,
                },
                status: "IN_PROGRESS",
            },
        });
        if (!trip) {
            throw new errorHandler_1.CustomError("Trip not found or access denied", 404);
        }
        // Record attendance manually
        const attendance = await database_1.default.attendance.upsert({
            where: {
                studentId_tripId: {
                    studentId,
                    tripId,
                },
            },
            update: {
                dropTime: dropTime || new Date(),
                status: "PRESENT",
                recordedBy: driverId,
            },
            create: {
                studentId,
                tripId,
                dropTime: dropTime || new Date(),
                status: "PRESENT",
                recordedBy: driverId,
            },
            include: {
                student: true,
            },
        });
        // Notify parents
        const { NotificationService } = await Promise.resolve().then(() => __importStar(require("./notificationService")));
        await NotificationService.notifyStudentDrop(studentId, trip.busId, tripId);
        // Emit real-time drop-off event
        this.emitTripEvent("student_drop", {
            tripId,
            studentId,
            stopId,
            dropTime: attendance.dropTime,
            location,
        });
        return attendance;
    }
    // Get student manifest for trip
    static async getStudentManifest(driverId, tripId) {
        // Verify driver has access to this trip
        const trip = await database_1.default.trip.findFirst({
            where: {
                id: tripId,
                driver: {
                    userId: driverId,
                },
            },
            include: {
                route: {
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
                    },
                },
            },
        });
        if (!trip) {
            throw new errorHandler_1.CustomError("Trip not found or access denied", 404);
        }
        // Get attendance records
        const attendance = await database_1.default.attendance.findMany({
            where: { tripId },
            include: {
                student: true,
            },
        });
        const attendanceMap = new Map(attendance.map((att) => [att.studentId, att]));
        // Build manifest
        const manifest = {
            tripId: trip.id,
            routeId: trip.routeId,
            busId: trip.busId,
            stops: trip.route.stops.map((stop) => ({
                id: stop.id,
                name: stop.name,
                sequence: stop.sequence,
                students: stop.assignments.map((assignment) => {
                    const student = assignment.student;
                    const attendance = attendanceMap.get(student.id);
                    return {
                        id: student.id,
                        firstName: student.firstName,
                        lastName: student.lastName,
                        grade: student.grade,
                        photo: student.photo,
                        emergencyContact: null, // Emergency contact is handled at driver level
                        medicalInfo: student.medicalInfo,
                        attendance: attendance
                            ? {
                                status: attendance.status,
                                pickupTime: attendance.pickupTime,
                                dropTime: attendance.dropTime,
                                notes: attendance.notes,
                            }
                            : null,
                        parent: student.parent
                            ? {
                                name: `${student.parent.user.firstName} ${student.parent.user.lastName}`,
                                phone: student.parent.user.phone,
                            }
                            : null,
                    };
                }),
            })),
        };
        return manifest;
    }
    // Update driver location and status
    static async updateDriverLocation(driverId, location, additionalData) {
        // Get driver's bus
        const driver = await database_1.default.driver.findUnique({
            where: { userId: driverId },
            include: { bus: true },
        });
        if (!driver || !driver.bus) {
            throw new errorHandler_1.CustomError("Driver or bus not found", 404);
        }
        // Record location
        await gpsTrackingService_1.GPSTrackingService.recordLocation({
            busId: driver.bus.id,
            latitude: location.latitude,
            longitude: location.longitude,
            speed: additionalData?.speed || 0,
            heading: additionalData?.heading || 0,
            accuracy: additionalData?.accuracy || 10,
        });
        // Update driver status
        await this.updateDriverStatus(driverId, {
            currentLocation: {
                latitude: location.latitude,
                longitude: location.longitude,
                timestamp: new Date(),
            },
        });
        // Check geofence violations
        await safetyService_1.SafetyService.checkGeofenceViolation(driver.bus.id, location.latitude, location.longitude);
        // Emit real-time location update
        this.emitDriverEvent("location_update", {
            driverId,
            busId: driver.bus.id,
            location: {
                ...location,
                timestamp: new Date(),
            },
            additionalData,
        });
    }
    // Get driver dashboard
    static async getDriverDashboard(driverId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const [driverInfo, currentTrip, todaysTrips, upcomingTrips, recentActivity, tripStats,] = await Promise.all([
            // Driver info
            database_1.default.user.findUnique({
                where: { id: driverId },
                include: {
                    driver: {
                        include: {
                            bus: true,
                        },
                    },
                },
            }),
            // Current trip
            this.getCurrentTrip(driverId),
            // Today's trips
            database_1.default.trip.findMany({
                where: {
                    driver: { userId: driverId },
                    createdAt: {
                        gte: today,
                        lt: tomorrow,
                    },
                },
                include: {
                    route: true,
                    bus: true,
                },
                orderBy: { createdAt: "desc" },
            }),
            // Upcoming trips (next 7 days)
            database_1.default.trip.findMany({
                where: {
                    driver: { userId: driverId },
                    status: "SCHEDULED",
                    scheduledStart: {
                        gte: new Date(),
                        lt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    },
                },
                include: {
                    route: true,
                    bus: true,
                },
                orderBy: { scheduledStart: "asc" },
                take: 5,
            }),
            // Recent activity (last 10 activities)
            this.getDriverRecentActivity(driverId, 10),
            // Trip statistics
            this.getDriverTripStats(driverId),
        ]);
        return {
            driverInfo,
            currentTrip,
            todaysTrips,
            upcomingTrips,
            recentActivity,
            statistics: tripStats,
        };
    }
    // Get driver trip history
    static async getDriverTripHistory(driverId, page = 1, limit = 20, filters) {
        const skip = (page - 1) * limit;
        const where = {
            driver: { userId: driverId },
        };
        if (filters?.startDate || filters?.endDate) {
            where.createdAt = {};
            if (filters.startDate)
                where.createdAt.gte = filters.startDate;
            if (filters.endDate)
                where.createdAt.lte = filters.endDate;
        }
        if (filters?.status) {
            where.status = filters.status;
        }
        const [trips, total] = await Promise.all([
            database_1.default.trip.findMany({
                where,
                include: {
                    route: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    bus: {
                        select: {
                            id: true,
                            plateNumber: true,
                            model: true,
                        },
                    },
                    _count: {
                        select: {
                            attendance: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            database_1.default.trip.count({ where }),
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            trips,
            total,
            page,
            limit,
            totalPages,
        };
    }
    // Trigger emergency from driver app
    static async triggerDriverEmergency(driverId, emergencyData) {
        // Get driver's bus info
        const driver = await database_1.default.driver.findUnique({
            where: { userId: driverId },
            include: { bus: true },
        });
        if (!driver || !driver.bus) {
            throw new errorHandler_1.CustomError("Driver bus information not found", 404);
        }
        // Trigger emergency alert
        const alert = await safetyService_1.SafetyService.triggerSOSAlert(driverId, {
            busId: driver.bus.id,
            driverId: driver.id,
            type: emergencyData.type,
            description: emergencyData.description,
            location: emergencyData.location,
        });
        return alert;
    }
    // Get driver earnings/report
    static async getDriverReport(driverId, period = "monthly") {
        const now = new Date();
        let startDate;
        switch (period) {
            case "daily":
                startDate = new Date(now.setHours(0, 0, 0, 0));
                break;
            case "weekly":
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case "monthly":
                startDate = new Date(now.setMonth(now.getMonth() - 1));
                break;
        }
        const [tripCount, totalStudents, totalDistance, completedTrips] = await Promise.all([
            // Total trips
            database_1.default.trip.count({
                where: {
                    driver: { userId: driverId },
                    createdAt: { gte: startDate },
                },
            }),
            // Total students transported
            database_1.default.attendance.count({
                where: {
                    trip: {
                        driver: { userId: driverId },
                        createdAt: { gte: startDate },
                    },
                    status: "PRESENT",
                },
            }),
            // Total distance (placeholder - would calculate from GPS data)
            database_1.default.trip.count({
                where: {
                    driver: { userId: driverId },
                    createdAt: { gte: startDate },
                    status: "COMPLETED",
                },
            }),
            // Completed trips
            database_1.default.trip.findMany({
                where: {
                    driver: { userId: driverId },
                    createdAt: { gte: startDate },
                    status: "COMPLETED",
                },
                include: {
                    route: {
                        select: { name: true },
                    },
                },
                orderBy: { createdAt: "desc" },
            }),
        ]);
        return {
            period,
            startDate,
            endDate: new Date(),
            summary: {
                totalTrips: tripCount,
                completedTrips: completedTrips.length,
                totalStudents,
                totalDistance: totalDistance * 15, // Placeholder calculation
                averageTripDuration: 45, // minutes
                onTimePerformance: 92, // percentage
            },
            trips: completedTrips,
        };
    }
    // Update driver status
    static async updateDriverStatus(driverId, status) {
        // In a real implementation, you'd store this in a DriverStatus table
        // For now, we'll just emit the status update
        this.emitDriverEvent("status_update", {
            driverId,
            ...status,
            lastUpdated: new Date(),
        });
    }
    // Get driver's assigned routes
    static async getDriverRoutes(driverId) {
        const routes = await database_1.default.route.findMany({
            where: {
                bus: {
                    driver: {
                        userId: driverId,
                    },
                },
                isActive: true,
            },
            include: {
                stops: {
                    include: {
                        _count: {
                            select: {
                                assignments: true,
                            },
                        },
                    },
                    orderBy: { sequence: "asc" },
                },
                bus: true,
                _count: {
                    select: {
                        assignments: true,
                    },
                },
            },
            orderBy: { name: "asc" },
        });
        return routes;
    }
    // Private helper methods
    static async getDriverRecentActivity(driverId, limit) {
        const activities = [];
        // Get recent trips
        const recentTrips = await database_1.default.trip.findMany({
            where: {
                driver: { userId: driverId },
            },
            include: {
                route: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
            take: Math.ceil(limit / 3),
        });
        // Get recent attendance
        const recentAttendances = await database_1.default.attendance.findMany({
            where: {
                trip: {
                    driver: { userId: driverId },
                },
            },
            include: {
                student: { select: { firstName: true, lastName: true } },
                trip: { select: { route: { select: { name: true } } } },
            },
            orderBy: { createdAt: "desc" },
            take: Math.ceil(limit / 3),
        });
        // Combine activities
        activities.push(...recentTrips.map((trip) => ({
            type: "TRIP",
            title: trip.status === "COMPLETED" ? "Trip Completed" : "Trip Started",
            description: `Route: ${trip.route.name}`,
            timestamp: trip.createdAt,
        })), ...recentAttendances.map((attendance) => ({
            type: "ATTENDANCE",
            title: "Student Attendance",
            description: `${attendance.student.firstName} ${attendance.student.lastName} - ${attendance.status}`,
            timestamp: attendance.createdAt,
        })));
        return activities
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
    }
    static async getDriverTripStats(driverId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [totalTripsToday, totalStudentsTransported, totalDistance] = await Promise.all([
            database_1.default.trip.count({
                where: {
                    driver: { userId: driverId },
                    createdAt: { gte: today },
                },
            }),
            database_1.default.attendance.count({
                where: {
                    trip: {
                        driver: { userId: driverId },
                        createdAt: { gte: today },
                    },
                    status: "PRESENT",
                },
            }),
            // Placeholder for distance calculation
            database_1.default.trip.count({
                where: {
                    driver: { userId: driverId },
                    createdAt: { gte: today },
                    status: "COMPLETED",
                },
            }),
        ]);
        return {
            totalTripsToday,
            totalStudentsTransported,
            totalDistance: totalDistance * 15, // Placeholder
            onTimePerformance: 92, // percentage
        };
    }
    static calculateNextStop(stops, currentLocation) {
        if (!currentLocation)
            return stops[0];
        // Find the closest upcoming stop
        let nextStop = null;
        let minDistance = Infinity;
        for (const stop of stops) {
            const distance = this.calculateDistance(currentLocation.latitude, currentLocation.longitude, stop.latitude, stop.longitude);
            if (distance < minDistance && distance > 100) {
                // Not too close to current location
                minDistance = distance;
                nextStop = stop;
            }
        }
        return nextStop;
    }
    static calculateTripProgress(stops, currentLocation) {
        if (!currentLocation || stops.length === 0)
            return 0;
        // Find current position relative to stops
        let completedStops = 0;
        for (const stop of stops) {
            const distance = this.calculateDistance(currentLocation.latitude, currentLocation.longitude, stop.latitude, stop.longitude);
            if (distance > 200) {
                // If stop is more than 200m away, consider it upcoming
                break;
            }
            completedStops++;
        }
        return Math.round((completedStops / stops.length) * 100);
    }
    static calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lon2 - lon1) * Math.PI) / 180;
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in meters
    }
    // Real-time event emitters
    static emitTripEvent(event, data) {
        server_1.io.emit(event, data);
        // Also emit to specific rooms
        if (data.tripId) {
            server_1.io.to(`trip_${data.tripId}`).emit(event, data);
        }
        if (data.driverId) {
            server_1.io.to(`driver_${data.driverId}`).emit(event, data);
        }
    }
    static emitDriverEvent(event, data) {
        server_1.io.emit(event, data);
        // Emit to driver room
        if (data.driverId) {
            server_1.io.to(`driver_${data.driverId}`).emit(event, data);
        }
    }
}
exports.DriverAppService = DriverAppService;
//# sourceMappingURL=driverAppService.js.map