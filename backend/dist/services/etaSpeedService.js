"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ETASpeedService = void 0;
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middleware/errorHandler");
const server_1 = require("../server");
const redis_1 = require("../config/redis");
class ETASpeedService {
    // Calculate ETA to next stop
    static async calculateETA(busId) {
        // Get current bus location
        const currentLocation = await (0, redis_1.getBusLocation)(busId);
        if (!currentLocation) {
            throw new errorHandler_1.CustomError("No current location data available for this bus", 404);
        }
        // Get bus route and active assignments
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
        const route = bus.routes[0];
        // Find next stop (simplified - in real implementation, track current progress)
        const nextStop = route.stops[0]; // Default to first stop
        if (!nextStop) {
            return {
                busId,
                currentLocation: {
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                },
            };
        }
        // Calculate distance and ETA
        const distance = this.calculateDistance(currentLocation.latitude, currentLocation.longitude, nextStop.latitude, nextStop.longitude);
        // Get average speed from recent tracking data
        const averageSpeed = await this.getAverageSpeed(busId, 30); // Last 30 minutes
        const effectiveSpeed = Math.max(averageSpeed || 30, 10); // Minimum 10 km/h
        // Apply traffic factor based on time of day
        const trafficFactor = this.getTrafficFactor();
        const adjustedSpeed = effectiveSpeed / trafficFactor;
        // Calculate ETA
        const estimatedDuration = (distance / 1000 / adjustedSpeed) * 60; // minutes
        const estimatedArrival = new Date(Date.now() + estimatedDuration * 60 * 1000);
        return {
            busId,
            nextStopId: nextStop.id,
            currentLocation: {
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
            },
            estimatedArrival,
            distanceToStop: Math.round(distance),
            estimatedDuration: Math.round(estimatedDuration * 10) / 10,
            averageSpeed: Math.round(effectiveSpeed * 10) / 10,
            trafficFactor: Math.round(trafficFactor * 100) / 100,
        };
    }
    // Monitor speed and detect violations
    static async monitorSpeed(busId, currentSpeed, location) {
        const speedLimit = this.DEFAULT_SPEED_LIMIT;
        // Get bus details for driver info
        const bus = await database_1.default.bus.findUnique({
            where: { id: busId },
            select: {
                driverId: true,
                schoolId: true,
            },
        });
        if (!bus) {
            throw new errorHandler_1.CustomError("Bus not found", 404);
        }
        let severity = "WARNING";
        let shouldAlert = false;
        if (currentSpeed >= this.CRITICAL_THRESHOLD) {
            severity = "CRITICAL";
            shouldAlert = true;
        }
        else if (currentSpeed >= this.VIOLATION_THRESHOLD) {
            severity = "VIOLATION";
            shouldAlert = true;
        }
        else if (currentSpeed >= this.WARNING_THRESHOLD) {
            severity = "WARNING";
            shouldAlert = true;
        }
        if (!shouldAlert) {
            return null; // No violation
        }
        const violation = {
            busId,
            driverId: bus.driverId || undefined,
            currentSpeed,
            speedLimit,
            location,
            timestamp: new Date(),
            severity,
        };
        // Record violation in database
        await database_1.default.speedViolation.create({
            data: {
                busId,
                driverId: bus.driverId,
                currentSpeed,
                speedLimit,
                latitude: location.latitude,
                longitude: location.longitude,
                severity,
                timestamp: new Date(),
            },
        });
        // Emit real-time alert
        server_1.io.to(`school_${bus.schoolId}`).emit("speed_violation", {
            ...violation,
            message: `Speed violation detected: ${currentSpeed} km/h (limit: ${speedLimit} km/h)`,
        });
        // Alert admin dashboard
        server_1.io.to("admin_dashboard").emit("speed_violation", violation);
        // Alert driver if connected
        if (bus.driverId) {
            server_1.io.to(`driver_${bus.driverId}`).emit("speed_alert", {
                severity,
                currentSpeed,
                speedLimit,
                message: `Speed limit exceeded! Current: ${currentSpeed} km/h, Limit: ${speedLimit} km/h`,
            });
        }
        return violation;
    }
    // Analyze ETA performance and delays
    static async analyzeETA(busId) {
        const eta = await this.calculateETA(busId);
        if (!eta.estimatedArrival || !eta.nextStopId) {
            return null;
        }
        // Get next stop details
        const nextStop = await database_1.default.routeStop.findUnique({
            where: { id: eta.nextStopId },
            select: {
                id: true,
                name: true,
                latitude: true,
                longitude: true,
                pickupTime: true,
                dropTime: true,
            },
        });
        if (!nextStop) {
            return null;
        }
        // Use pickup time as scheduled arrival (simplified)
        const scheduledArrival = nextStop.pickupTime
            ? new Date(`1970-01-01T${nextStop.pickupTime}:00`)
            : null;
        const estimatedArrival = eta.estimatedArrival;
        if (!scheduledArrival) {
            return null;
        }
        const delayMinutes = Math.round((estimatedArrival.getTime() - scheduledArrival.getTime()) / (1000 * 60));
        const isDelayed = delayMinutes > 5; // Consider delayed if more than 5 minutes late
        const analysis = {
            busId,
            routeId: "", // Would need to get from route data
            scheduledArrival,
            estimatedArrival,
            delayMinutes,
            isDelayed,
            nextStop: {
                id: nextStop.id,
                name: nextStop.name,
                latitude: nextStop.latitude,
                longitude: nextStop.longitude,
            },
        };
        // Generate recommendations
        if (isDelayed) {
            analysis.recommendations = [
                "Consider taking alternative route to avoid traffic",
                "Notify parents about delay",
                "Contact school about potential late arrival",
            ];
            if (delayMinutes > 15) {
                analysis.recommendations.push("Consider skipping non-essential stops");
            }
        }
        return analysis;
    }
    // Get speed analytics for a bus
    static async getSpeedAnalytics(busId, startDate, endDate) {
        const end = endDate || new Date();
        const start = startDate || new Date(end.getTime() - 24 * 60 * 60 * 1000); // Default to last 24 hours
        // Get GPS tracking data for the period
        const trackingData = await database_1.default.gPSTracking.findMany({
            where: {
                busId,
                timestamp: {
                    gte: start,
                    lte: end,
                },
                speed: { not: null },
            },
            select: {
                speed: true,
                timestamp: true,
                latitude: true,
                longitude: true,
            },
            orderBy: { timestamp: "asc" },
        });
        if (trackingData.length === 0) {
            return {
                busId,
                period: { start, end },
                averageSpeed: 0,
                maxSpeed: 0,
                minSpeed: 0,
                speedViolations: 0,
                totalDistance: 0,
                violations: [],
            };
        }
        const speeds = trackingData
            .map((t) => t.speed)
            .filter((s) => s !== null);
        const averageSpeed = speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length;
        const maxSpeed = Math.max(...speeds);
        const minSpeed = Math.min(...speeds);
        // Get speed violations for the period
        const violations = await database_1.default.speedViolation.findMany({
            where: {
                busId,
                timestamp: {
                    gte: start,
                    lte: end,
                },
            },
            orderBy: { timestamp: "desc" },
        });
        // Calculate approximate distance
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
            busId,
            period: { start, end },
            averageSpeed: Math.round(averageSpeed * 10) / 10,
            maxSpeed: Math.round(maxSpeed * 10) / 10,
            minSpeed: Math.round(minSpeed * 10) / 10,
            speedViolations: violations.length,
            totalDistance: Math.round(totalDistance * 10) / 10,
            violations: violations.map((v) => ({
                busId: v.busId,
                driverId: v.driverId || undefined,
                currentSpeed: v.currentSpeed,
                speedLimit: v.speedLimit,
                location: {
                    latitude: v.latitude,
                    longitude: v.longitude,
                },
                timestamp: v.timestamp,
                severity: v.severity,
            })),
        };
    }
    // Get fleet-wide speed statistics
    static async getFleetSpeedStats(schoolId) {
        const where = schoolId ? { schoolId } : {};
        // Get all active buses
        const buses = await database_1.default.bus.findMany({
            where: {
                ...where,
                isActive: true,
            },
            select: { id: true },
        });
        if (buses.length === 0) {
            return {
                totalBuses: 0,
                averageFleetSpeed: 0,
                totalViolations: 0,
                criticalViolations: 0,
            };
        }
        // Get speed analytics for each bus (last 24 hours)
        const busAnalytics = await Promise.all(buses.map((bus) => this.getSpeedAnalytics(bus.id)));
        const totalViolations = busAnalytics.reduce((sum, analytics) => sum + analytics.speedViolations, 0);
        const totalSpeed = busAnalytics.reduce((sum, analytics) => sum + analytics.averageSpeed, 0);
        const averageFleetSpeed = totalSpeed / busAnalytics.length;
        const criticalViolations = busAnalytics.reduce((sum, analytics) => sum +
            analytics.violations.filter((v) => v.severity === "CRITICAL").length, 0);
        // Find bus with most violations
        const busWithMostViolations = busAnalytics.reduce((max, current) => current.speedViolations > max.speedViolations ? current : max);
        return {
            totalBuses: buses.length,
            averageFleetSpeed: Math.round(averageFleetSpeed * 10) / 10,
            totalViolations,
            criticalViolations,
            mostViolationsBus: busWithMostViolations.speedViolations > 0
                ? busWithMostViolations.busId
                : undefined,
        };
    }
    // Predictive ETA based on historical data
    static async predictETA(busId, targetStopId) {
        // Get historical trips to this stop
        const historicalTrips = await database_1.default.attendance.findMany({
            where: {
                trip: {
                    busId,
                    attendance: {
                        some: {
                            student: {
                                assignments: {
                                    some: {
                                        stopId: targetStopId,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            select: {
                trip: {
                    select: {
                        scheduledStart: true,
                        actualStart: true,
                    },
                },
                pickupTime: true,
                dropTime: true,
            },
            take: 20, // Use last 20 trips for prediction
            orderBy: { createdAt: "desc" },
        });
        if (historicalTrips.length === 0) {
            // Fallback to basic ETA calculation
            const eta = await this.calculateETA(busId);
            return {
                predictedArrival: eta.estimatedArrival || new Date(),
                confidence: 0.3,
                basedOnTrips: 0,
                averageDelay: 0,
            };
        }
        // Calculate average delay to this stop
        const delays = [];
        historicalTrips.forEach((attendance) => {
            if (attendance.dropTime && attendance.trip.scheduledStart) {
                const scheduledArrival = new Date(attendance.trip.scheduledStart.getTime() + 2 * 60 * 60 * 1000); // Assume 2 hours scheduled
                const actualArrival = attendance.dropTime;
                const delay = (actualArrival.getTime() - scheduledArrival.getTime()) / (1000 * 60); // minutes
                delays.push(delay);
            }
        });
        const averageDelay = delays.length > 0
            ? delays.reduce((sum, delay) => sum + delay, 0) / delays.length
            : 0;
        // Get current ETA and apply historical adjustment
        const currentETA = await this.calculateETA(busId);
        const predictedArrival = currentETA.estimatedArrival
            ? new Date(currentETA.estimatedArrival.getTime() + averageDelay * 60 * 1000)
            : new Date();
        // Calculate confidence based on data points and variance
        const variance = delays.length > 1
            ? delays.reduce((sum, delay) => sum + Math.pow(delay - averageDelay, 2), 0) / delays.length
            : 0;
        const standardDeviation = Math.sqrt(variance);
        const confidence = Math.max(0.1, Math.min(0.9, 1 - standardDeviation / 30)); // Normalize to 0.1-0.9
        return {
            predictedArrival,
            confidence: Math.round(confidence * 100) / 100,
            basedOnTrips: historicalTrips.length,
            averageDelay: Math.round(averageDelay * 10) / 10,
        };
    }
    // Helper: Calculate distance between two GPS coordinates (Haversine formula)
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
    // Helper: Get average speed from recent tracking data
    static async getAverageSpeed(busId, minutesBack) {
        const since = new Date(Date.now() - minutesBack * 60 * 1000);
        const trackingData = await database_1.default.gPSTracking.findMany({
            where: {
                busId,
                timestamp: { gte: since },
                speed: { not: null },
            },
            select: { speed: true },
            take: 50, // Last 50 readings
            orderBy: { timestamp: "desc" },
        });
        if (trackingData.length === 0) {
            return null;
        }
        const speeds = trackingData
            .map((t) => t.speed)
            .filter((s) => s !== null);
        return speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length;
    }
    // Helper: Get traffic factor based on time of day
    static getTrafficFactor() {
        const hour = new Date().getHours();
        // Peak hours have higher traffic factors
        if ((hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 18)) {
            return 1.3; // 30% slower during rush hour
        }
        else if (hour >= 11 && hour <= 13) {
            return 1.1; // 10% slower during lunch hour
        }
        else {
            return 1.0; // Normal traffic
        }
    }
}
exports.ETASpeedService = ETASpeedService;
ETASpeedService.DEFAULT_SPEED_LIMIT = 50; // km/h for school zones
ETASpeedService.WARNING_THRESHOLD = 55; // km/h
ETASpeedService.VIOLATION_THRESHOLD = 65; // km/h
ETASpeedService.CRITICAL_THRESHOLD = 80; // km/h
//# sourceMappingURL=etaSpeedService.js.map