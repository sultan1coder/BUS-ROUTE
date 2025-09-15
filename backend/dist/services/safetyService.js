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
exports.SafetyService = void 0;
const database_1 = __importDefault(require("../config/database"));
const server_1 = require("../server");
const errorHandler_1 = require("../middleware/errorHandler");
class SafetyService {
    // Trigger SOS alert
    static async triggerSOSAlert(userId, alertData) {
        const { busId, driverId, type, description, location, severity = "CRITICAL", } = alertData;
        // Verify user has permission to trigger alerts for this bus/driver
        if (busId || driverId) {
            await this.verifyUserAccess(userId, busId, driverId);
        }
        // Create emergency alert
        const alert = await database_1.default.emergencyAlert.create({
            data: {
                busId,
                driverId,
                type,
                severity,
                description,
                location: location ? JSON.stringify(location) : undefined,
            },
            include: {
                bus: {
                    select: {
                        id: true,
                        plateNumber: true,
                        driver: {
                            select: {
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
                    },
                },
                driver: {
                    select: {
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
            },
        });
        // Send emergency notifications
        await this.sendEmergencyNotifications(alert);
        // Emit real-time alert via Socket.IO
        this.emitRealtimeAlert("sos_alert", {
            id: alert.id,
            type: alert.type,
            severity: alert.severity,
            description: alert.description,
            location: location,
            bus: alert.bus || null,
            driver: alert.driver || null,
            createdAt: alert.createdAt,
        });
        // Log the emergency event
        await this.logEmergencyEvent(alert, "SOS_TRIGGERED");
        return alert;
    }
    // Create or update geofence
    static async createGeofence(geofenceData) {
        const { busId, name, latitude, longitude, radius, alertOnEnter = false, alertOnExit = true, } = geofenceData;
        // Verify bus exists
        const bus = await database_1.default.bus.findUnique({
            where: { id: busId },
            select: { id: true, schoolId: true },
        });
        if (!bus) {
            throw new errorHandler_1.CustomError("Bus not found", 404);
        }
        const geofence = await database_1.default.geofence.create({
            data: {
                busId,
                name,
                latitude,
                longitude,
                radius,
                alertOnEnter,
                alertOnExit,
            },
        });
        return geofence;
    }
    // Check geofence violations
    static async checkGeofenceViolation(busId, latitude, longitude) {
        const geofences = await database_1.default.geofence.findMany({
            where: {
                busId,
                isActive: true,
            },
        });
        for (const geofence of geofences) {
            const distance = this.calculateDistance(latitude, longitude, geofence.latitude, geofence.longitude);
            const isInside = distance <= geofence.radius;
            // Check if this is an enter/exit event
            // For simplicity, we'll assume we need to track previous state
            // In a real implementation, you'd store last known position
            if (isInside && geofence.alertOnEnter) {
                return {
                    violated: true,
                    geofence,
                    action: "ENTER",
                };
            }
            if (!isInside && geofence.alertOnExit) {
                return {
                    violated: true,
                    geofence,
                    action: "EXIT",
                };
            }
        }
        return { violated: false };
    }
    // Handle geofence violation
    static async handleGeofenceViolation(busId, geofence, action, location) {
        // Create emergency alert for geofence violation
        const alert = await database_1.default.emergencyAlert.create({
            data: {
                busId,
                type: "GEOFENCE_VIOLATION",
                severity: "HIGH",
                description: `Bus ${action === "ENTER" ? "entered" : "exited"} geofence: ${geofence.name}`,
                location: JSON.stringify(location),
            },
        });
        // Send notifications
        await this.sendEmergencyNotifications(alert);
        // Emit real-time alert
        this.emitRealtimeAlert("geofence_violation", {
            busId,
            geofence,
            action,
            location,
            alertId: alert.id,
        });
    }
    // Monitor speed violations
    static async monitorSpeedViolation(speedData) {
        const { busId, currentSpeed, speedLimit, location } = speedData;
        // Determine severity based on speed difference
        let severity = "LOW";
        const speedDifference = currentSpeed - speedLimit;
        if (speedDifference >= 20)
            severity = "CRITICAL";
        else if (speedDifference >= 15)
            severity = "HIGH";
        else if (speedDifference >= 10)
            severity = "MEDIUM";
        // Create emergency alert
        const alert = await database_1.default.emergencyAlert.create({
            data: {
                busId,
                type: "SPEED_VIOLATION",
                severity,
                description: `Speed violation: ${currentSpeed} km/h (limit: ${speedLimit} km/h)`,
                location: location ? JSON.stringify(location) : undefined,
            },
        });
        // Send notifications
        await this.sendEmergencyNotifications(alert);
        // Emit real-time alert
        this.emitRealtimeAlert("speed_violation", {
            busId,
            currentSpeed,
            speedLimit,
            location,
            severity,
            alertId: alert.id,
        });
        // Also send speed violation notification
        const { NotificationService } = await Promise.resolve().then(() => __importStar(require("./notificationService")));
        await NotificationService.notifySpeedViolation(busId, currentSpeed, speedLimit, severity);
    }
    // Resolve emergency alert
    static async resolveAlert(alertId, resolvedBy, resolutionNotes) {
        // First get the current alert to access its description
        const currentAlert = await database_1.default.emergencyAlert.findUnique({
            where: { id: alertId },
            select: { description: true, resolved: true },
        });
        if (!currentAlert) {
            throw new errorHandler_1.CustomError("Alert not found", 404);
        }
        const alert = await database_1.default.emergencyAlert.update({
            where: { id: alertId },
            data: {
                resolved: true,
                resolvedAt: new Date(),
                resolvedBy,
                description: resolutionNotes
                    ? `${currentAlert.description}\n\nResolution: ${resolutionNotes}`
                    : undefined,
            },
            include: {
                bus: {
                    select: {
                        id: true,
                        plateNumber: true,
                    },
                },
                driver: {
                    select: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
            },
        });
        // Emit resolution event
        this.emitRealtimeAlert("alert_resolved", {
            alertId,
            resolvedBy,
            resolvedAt: alert.resolvedAt,
            resolutionNotes,
        });
        return alert;
    }
    // Get active emergency alerts
    static async getActiveAlerts(filters) {
        const where = {
            resolved: false,
        };
        if (filters?.busId)
            where.busId = filters.busId;
        if (filters?.driverId)
            where.driverId = filters.driverId;
        if (filters?.type)
            where.type = filters.type;
        if (filters?.severity)
            where.severity = filters.severity;
        const alerts = await database_1.default.emergencyAlert.findMany({
            where,
            include: {
                bus: {
                    select: {
                        id: true,
                        plateNumber: true,
                        driver: {
                            select: {
                                user: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                    },
                                },
                            },
                        },
                    },
                },
                driver: {
                    select: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        return alerts;
    }
    // Get geofences for a bus
    static async getBusGeofences(busId) {
        return await database_1.default.geofence.findMany({
            where: {
                busId,
                isActive: true,
            },
            orderBy: { createdAt: "desc" },
        });
    }
    // Update geofence
    static async updateGeofence(geofenceId, updates) {
        const geofence = await database_1.default.geofence.update({
            where: { id: geofenceId },
            data: updates,
        });
        return geofence;
    }
    // Delete geofence
    static async deleteGeofence(geofenceId) {
        try {
            await database_1.default.geofence.delete({
                where: { id: geofenceId },
            });
            return true;
        }
        catch (error) {
            return false;
        }
    }
    // Get safety report
    static async getSafetyReport(schoolId, dateRange) {
        const where = {};
        if (schoolId) {
            where.bus = {
                schoolId,
            };
        }
        if (dateRange) {
            where.createdAt = {
                gte: dateRange.start,
                lte: dateRange.end,
            };
        }
        const [totalAlerts, activeAlerts, resolvedAlerts, alertsByType, alertsBySeverity, recentAlerts, geofenceViolations, speedViolations,] = await Promise.all([
            // Total alerts
            database_1.default.emergencyAlert.count({ where }),
            // Active alerts
            database_1.default.emergencyAlert.count({
                where: { ...where, resolved: false },
            }),
            // Resolved alerts
            database_1.default.emergencyAlert.count({
                where: { ...where, resolved: true },
            }),
            // Alerts by type
            database_1.default.emergencyAlert.groupBy({
                by: ["type"],
                where,
                _count: true,
            }),
            // Alerts by severity
            database_1.default.emergencyAlert.groupBy({
                by: ["severity"],
                where,
                _count: true,
            }),
            // Recent alerts
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
            // Geofence violations
            database_1.default.emergencyAlert.count({
                where: { ...where, type: "GEOFENCE_VIOLATION" },
            }),
            // Speed violations
            database_1.default.emergencyAlert.count({
                where: { ...where, type: "SPEED_VIOLATION" },
            }),
        ]);
        return {
            totalAlerts,
            activeAlerts,
            resolvedAlerts,
            alertsByType: alertsByType.map((item) => ({
                type: item.type,
                count: item._count,
            })),
            alertsBySeverity: alertsBySeverity.map((item) => ({
                severity: item.severity,
                count: item._count,
            })),
            recentAlerts,
            geofenceViolations,
            speedViolations,
        };
    }
    // Get emergency contacts for a user
    static async getEmergencyContacts(userId) {
        // In a real implementation, you'd have an EmergencyContact model
        // For now, we'll return school staff and admin contacts
        const contacts = await database_1.default.user.findMany({
            where: {
                role: { in: ["SCHOOL_STAFF", "ADMIN"] },
                isActive: true,
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
            },
        });
        return contacts.map((contact) => ({
            id: contact.id,
            name: `${contact.firstName} ${contact.lastName}`,
            phone: contact.phone || "",
            relationship: contact.role === "ADMIN" ? "Administrator" : "School Staff",
            isPrimary: contact.role === "ADMIN",
        }));
    }
    // Send emergency SMS/text message (placeholder)
    static async sendEmergencySMS(phoneNumber, message) {
        // This would integrate with SMS service like Twilio, AWS SNS, etc.
        console.log(`Emergency SMS to ${phoneNumber}: ${message}`);
        // For now, just log and return success
        // In production, implement actual SMS sending
        return true;
    }
    // Log emergency event for audit trail
    static async logEmergencyEvent(alert, event) {
        // In a real implementation, you'd have an EmergencyLog model
        console.log(`Emergency Event: ${event}`, {
            alertId: alert.id,
            type: alert.type,
            severity: alert.severity,
            timestamp: new Date(),
        });
    }
    // Send emergency notifications to relevant parties
    static async sendEmergencyNotifications(alert) {
        try {
            const { NotificationService } = await Promise.resolve().then(() => __importStar(require("./notificationService")));
            // Notify all admins and school staff
            const recipients = await database_1.default.user.findMany({
                where: {
                    role: { in: ["ADMIN", "SCHOOL_STAFF"] },
                },
                select: { id: true },
            });
            // Send emergency alert notification
            await NotificationService.notifyEmergency(alert.busId || "Unknown Bus", alert.type, alert.description, alert.location ? JSON.parse(alert.location.toString()) : undefined);
            // If it's a critical alert, also send via messaging system
            if (alert.severity === "CRITICAL") {
                const { CommunicationService } = await Promise.resolve().then(() => __importStar(require("./communicationService")));
                // Send emergency message to school staff
                for (const recipient of recipients) {
                    await CommunicationService.sendMessage("system", // System-generated message
                    {
                        receiverId: recipient.id,
                        type: "EMERGENCY",
                        content: `EMERGENCY ALERT: ${alert.description}`,
                    });
                }
            }
        }
        catch (error) {
            console.error("Error sending emergency notifications:", error);
        }
    }
    // Emit real-time alert via Socket.IO
    static emitRealtimeAlert(event, data) {
        server_1.io.emit(event, data);
        // Also emit to specific rooms
        if (data.busId) {
            server_1.io.to(`bus_${data.busId}`).emit(event, data);
        }
        if (data.driverId) {
            server_1.io.to(`driver_${data.driverId}`).emit(event, data);
        }
        // Emit to admin room
        server_1.io.to("admin:all").emit(event, data);
    }
    // Calculate distance between two coordinates (Haversine formula)
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
    // Verify user has access to trigger alerts for bus/driver
    static async verifyUserAccess(userId, busId, driverId) {
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });
        if (!user) {
            throw new errorHandler_1.CustomError("User not found", 404);
        }
        // Admins and school staff can trigger alerts for any bus/driver
        if (["ADMIN", "SCHOOL_STAFF"].includes(user.role)) {
            return;
        }
        // Drivers can only trigger alerts for their own bus
        if (user.role === "DRIVER" && busId) {
            const driver = await database_1.default.driver.findFirst({
                where: {
                    userId,
                    bus: {
                        id: busId,
                    },
                },
            });
            if (!driver) {
                throw new errorHandler_1.CustomError("You don't have permission to trigger alerts for this bus", 403);
            }
        }
        // Parents cannot trigger SOS alerts directly (only through driver app)
        if (user.role === "PARENT") {
            throw new errorHandler_1.CustomError("Parents cannot trigger emergency alerts directly", 403);
        }
    }
    // Clean up old resolved alerts
    static async cleanupOldAlerts(daysToKeep = 365) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        const result = await database_1.default.emergencyAlert.deleteMany({
            where: {
                resolved: true,
                createdAt: {
                    lt: cutoffDate,
                },
            },
        });
        return result.count;
    }
    // Get alert history
    static async getAlertHistory(filters, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const where = {};
        if (filters?.busId)
            where.busId = filters.busId;
        if (filters?.driverId)
            where.driverId = filters.driverId;
        if (filters?.type)
            where.type = filters.type;
        if (filters?.resolved !== undefined)
            where.resolved = filters.resolved;
        if (filters?.startDate || filters?.endDate) {
            where.createdAt = {};
            if (filters.startDate)
                where.createdAt.gte = filters.startDate;
            if (filters.endDate)
                where.createdAt.lte = filters.endDate;
        }
        const [alerts, total] = await Promise.all([
            database_1.default.emergencyAlert.findMany({
                where,
                include: {
                    bus: {
                        select: {
                            id: true,
                            plateNumber: true,
                        },
                    },
                    driver: {
                        select: {
                            user: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            database_1.default.emergencyAlert.count({ where }),
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            alerts,
            total,
            page,
            limit,
            totalPages,
        };
    }
}
exports.SafetyService = SafetyService;
//# sourceMappingURL=safetyService.js.map