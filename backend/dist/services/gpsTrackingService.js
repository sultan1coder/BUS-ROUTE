"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GPSTrackingService = void 0;
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middleware/errorHandler");
const redis_1 = require("../config/redis");
const server_1 = require("../server");
class GPSTrackingService {
    // Record GPS location data
    static async recordLocation(gpsData) {
        const { busId, latitude, longitude, speed, heading, accuracy, altitude, timestamp = new Date(), tripId, } = gpsData;
        // Validate bus exists and is active
        const bus = await database_1.default.bus.findUnique({
            where: { id: busId },
            include: {
                school: true,
                driver: {
                    include: {
                        user: true,
                    },
                },
            },
        });
        if (!bus || !bus.isActive) {
            throw new errorHandler_1.CustomError("Bus not found or inactive", 404);
        }
        // Validate coordinates
        if (latitude < -90 || latitude > 90) {
            throw new errorHandler_1.CustomError("Invalid latitude", 400);
        }
        if (longitude < -180 || longitude > 180) {
            throw new errorHandler_1.CustomError("Invalid longitude", 400);
        }
        // Create GPS tracking record
        const trackingRecord = await database_1.default.gPSTracking.create({
            data: {
                busId,
                latitude,
                longitude,
                speed,
                heading,
                accuracy,
                timestamp,
                tripId,
                isValid: true,
            },
        });
        // Cache current location in Redis for real-time access
        const locationData = {
            busId,
            latitude,
            longitude,
            speed,
            heading,
            accuracy,
            altitude,
            timestamp,
            bus: {
                id: bus.id,
                plateNumber: bus.plateNumber,
                model: bus.model,
                driver: bus.driver
                    ? {
                        id: bus.driver.id,
                        firstName: bus.driver.user.firstName,
                        lastName: bus.driver.user.lastName,
                    }
                    : null,
            },
        };
        await (0, redis_1.setBusLocation)(busId, locationData);
        // Emit real-time location update via Socket.IO
        server_1.io.to(`parent:all`).emit("bus_location", locationData);
        server_1.io.to(`school_${bus.schoolId}`).emit("bus_location", locationData);
        server_1.io.to("admin_dashboard").emit("bus_location", locationData);
        // If bus has a driver, emit to driver's room
        if (bus.driver) {
            server_1.io.to(`driver_${bus.driver.id}`).emit("bus_location", locationData);
        }
        return trackingRecord;
    }
    // Get current location of a bus
    static async getCurrentLocation(busId) {
        // Try Redis cache first
        const cachedLocation = await (0, redis_1.getBusLocation)(busId);
        if (cachedLocation) {
            return {
                ...cachedLocation,
                source: "cache",
            };
        }
        // Fallback to database
        const latestTracking = await database_1.default.gPSTracking.findFirst({
            where: { busId },
            orderBy: { timestamp: "desc" },
            include: {
                bus: {
                    select: {
                        id: true,
                        plateNumber: true,
                        model: true,
                        driver: {
                            select: {
                                id: true,
                                user: {
                                    select: {
                                        firstName: true,
                                        lastName: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!latestTracking) {
            throw new errorHandler_1.CustomError("No location data found for this bus", 404);
        }
        const locationData = {
            busId,
            latitude: latestTracking.latitude,
            longitude: latestTracking.longitude,
            speed: latestTracking.speed,
            heading: latestTracking.heading,
            accuracy: latestTracking.accuracy,
            timestamp: latestTracking.timestamp,
            source: "database",
            bus: latestTracking.bus,
        };
        // Cache for future requests
        await (0, redis_1.setBusLocation)(busId, locationData);
        return locationData;
    }
    // Get location history for a bus
    static async getLocationHistory(filters, page = 1, limit = 100) {
        const { busId, startDate, endDate, tripId } = filters;
        const skip = (page - 1) * limit;
        const where = {
            isValid: true,
        };
        if (busId) {
            where.busId = busId;
        }
        if (tripId) {
            where.tripId = tripId;
        }
        if (startDate || endDate) {
            where.timestamp = {};
            if (startDate)
                where.timestamp.gte = startDate;
            if (endDate)
                where.timestamp.lte = endDate;
        }
        const [locations, total] = await Promise.all([
            database_1.default.gPSTracking.findMany({
                where,
                include: {
                    bus: {
                        select: {
                            id: true,
                            plateNumber: true,
                            model: true,
                        },
                    },
                    trip: {
                        select: {
                            id: true,
                            route: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { timestamp: "desc" },
                skip,
                take: limit,
            }),
            database_1.default.gPSTracking.count({ where }),
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            locations,
            total,
            page,
            limit,
            totalPages,
        };
    }
    // Get multiple buses' current locations
    static async getMultipleBusLocations(busIds) {
        const locations = [];
        for (const busId of busIds) {
            try {
                const location = await this.getCurrentLocation(busId);
                locations.push(location);
            }
            catch (error) {
                // Skip buses without location data
                console.warn(`No location data for bus ${busId}`);
            }
        }
        return locations;
    }
    // Analyze speed patterns for a bus
    static async analyzeSpeed(busId, startDate, endDate) {
        const where = {
            busId,
            isValid: true,
        };
        if (startDate || endDate) {
            where.timestamp = {};
            if (startDate)
                where.timestamp.gte = startDate;
            if (endDate)
                where.timestamp.lte = endDate;
        }
        const trackingData = await database_1.default.gPSTracking.findMany({
            where,
            select: {
                speed: true,
                timestamp: true,
            },
            orderBy: { timestamp: "asc" },
        });
        if (trackingData.length === 0) {
            return {
                averageSpeed: 0,
                maxSpeed: 0,
                minSpeed: 0,
                speedViolations: 0,
                totalDistance: 0,
            };
        }
        const speeds = trackingData
            .map((data) => data.speed)
            .filter((speed) => speed !== null);
        const averageSpeed = speeds.length > 0
            ? speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length
            : 0;
        const maxSpeed = speeds.length > 0 ? Math.max(...speeds) : 0;
        const minSpeed = speeds.length > 0 ? Math.min(...speeds) : 0;
        // Count speed violations (assuming speed limit of 50 km/h for school buses)
        const speedLimit = 50;
        const speedViolations = speeds.filter((speed) => speed > speedLimit).length;
        // Calculate approximate distance traveled
        let totalDistance = 0;
        for (let i = 1; i < trackingData.length; i++) {
            const prev = trackingData[i - 1];
            const curr = trackingData[i];
            if (prev.speed && curr.speed) {
                // Simple distance calculation: speed * time
                const timeDiff = (curr.timestamp.getTime() - prev.timestamp.getTime()) /
                    (1000 * 60 * 60); // hours
                totalDistance += ((prev.speed + curr.speed) / 2) * timeDiff; // average speed * time
            }
        }
        return {
            averageSpeed: Math.round(averageSpeed * 10) / 10,
            maxSpeed: Math.round(maxSpeed * 10) / 10,
            minSpeed: Math.round(minSpeed * 10) / 10,
            speedViolations,
            totalDistance: Math.round(totalDistance * 10) / 10,
        };
    }
    // Check if bus is within geofence
    static async checkGeofenceStatus(busId) {
        const location = await this.getCurrentLocation(busId);
        const geofences = await database_1.default.geofence.findMany({
            where: {
                busId,
                isActive: true,
            },
        });
        for (const geofence of geofences) {
            const distance = this.calculateDistance(location.latitude, location.longitude, geofence.latitude, geofence.longitude);
            if (distance <= geofence.radius) {
                return {
                    inGeofence: true,
                    geofence,
                    distance,
                };
            }
        }
        return {
            inGeofence: false,
        };
    }
    // Calculate distance between two GPS coordinates (Haversine formula)
    static calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) *
                Math.cos(this.toRadians(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c * 1000; // Convert to meters
    }
    static toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    // Clean up old tracking data (older than specified days)
    static async cleanupOldData(daysToKeep = 90) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        const result = await database_1.default.gPSTracking.deleteMany({
            where: {
                timestamp: {
                    lt: cutoffDate,
                },
            },
        });
        return result.count;
    }
    // Get bus route for ETA calculations
    static async getBusRoute(busId) {
        const bus = await database_1.default.bus.findUnique({
            where: { id: busId },
            include: {
                routes: {
                    where: { isActive: true },
                    include: {
                        stops: {
                            where: { isActive: true },
                            orderBy: { sequence: "asc" },
                        },
                    },
                },
            },
        });
        if (!bus || !bus.routes.length) {
            throw new errorHandler_1.CustomError("No active route found for this bus", 404);
        }
        return bus.routes[0]; // Return the first active route
    }
    // Calculate ETA to next stop
    static async calculateETA(busId) {
        try {
            const currentLocation = await this.getCurrentLocation(busId);
            const route = await this.getBusRoute(busId);
            if (!route.stops.length) {
                return {};
            }
            // Find the next stop (simplified - in a real system, you'd track current stop)
            const nextStop = route.stops[0]; // For demo, assume first stop
            const distance = this.calculateDistance(currentLocation.latitude, currentLocation.longitude, nextStop.latitude, nextStop.longitude);
            // Estimate time based on average speed (assume 30 km/h for school zones)
            const averageSpeed = 30; // km/h
            const estimatedDuration = (distance / 1000 / averageSpeed) * 60 * 60 * 1000; // milliseconds
            const eta = new Date(Date.now() + estimatedDuration);
            return {
                nextStop,
                eta,
                distance: Math.round(distance),
                estimatedDuration: Math.round(estimatedDuration / 1000 / 60), // minutes
            };
        }
        catch (error) {
            // Return empty object if calculation fails
            return {};
        }
    }
    // Get tracking statistics for a bus
    static async getTrackingStats(busId, days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const [stats, latestRecord] = await Promise.all([
            database_1.default.gPSTracking.aggregate({
                where: {
                    busId,
                    timestamp: { gte: startDate },
                    isValid: true,
                },
                _count: { id: true },
                _avg: { speed: true },
            }),
            database_1.default.gPSTracking.findFirst({
                where: { busId },
                orderBy: { timestamp: "desc" },
                select: { timestamp: true },
            }),
        ]);
        // Calculate approximate distance
        const trackingData = await database_1.default.gPSTracking.findMany({
            where: {
                busId,
                timestamp: { gte: startDate },
                isValid: true,
            },
            select: {
                latitude: true,
                longitude: true,
                timestamp: true,
                speed: true,
            },
            orderBy: { timestamp: "asc" },
        });
        let totalDistance = 0;
        for (let i = 1; i < trackingData.length; i++) {
            const prev = trackingData[i - 1];
            const curr = trackingData[i];
            if (prev.speed && curr.speed) {
                const timeDiff = (curr.timestamp.getTime() - prev.timestamp.getTime()) /
                    (1000 * 60 * 60);
                totalDistance += ((prev.speed + curr.speed) / 2) * timeDiff;
            }
        }
        return {
            totalRecords: stats._count.id,
            averageSpeed: stats._avg.speed
                ? Math.round(stats._avg.speed * 10) / 10
                : 0,
            totalDistance: Math.round(totalDistance * 10) / 10,
            lastUpdate: latestRecord?.timestamp,
            isActive: !!latestRecord &&
                Date.now() - latestRecord.timestamp.getTime() < 30 * 60 * 1000, // Active if updated within 30 minutes
        };
    }
}
exports.GPSTrackingService = GPSTrackingService;
//# sourceMappingURL=gpsTrackingService.js.map