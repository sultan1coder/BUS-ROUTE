"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middleware/errorHandler");
class AdminService {
    // Get system overview
    static async getSystemOverview() {
        const [totalUsers, totalBuses, totalDrivers, totalStudents, totalSchools, activeTrips, activeAlerts, systemHealth,] = await Promise.all([
            // Total users
            database_1.default.user.count(),
            // Total buses
            database_1.default.bus.count(),
            // Total drivers
            database_1.default.driver.count(),
            // Total students
            database_1.default.student.count(),
            // Total schools
            database_1.default.school.count(),
            // Active trips (assuming trips have status)
            database_1.default.trip.count({
                where: { status: "IN_PROGRESS" },
            }),
            // Active alerts
            database_1.default.emergencyAlert.count({
                where: { resolved: false },
            }),
            // System health based on active alerts
            this.getSystemHealth(),
        ]);
        return {
            totalUsers,
            totalBuses,
            totalDrivers,
            totalStudents,
            totalSchools,
            activeTrips,
            activeAlerts,
            systemHealth,
            uptime: process.uptime(),
            lastUpdated: new Date(),
        };
    }
    // Get user analytics
    static async getUserAnalytics(dateRange) {
        const where = {};
        if (dateRange) {
            where.createdAt = {
                gte: dateRange.start,
                lte: dateRange.end,
            };
        }
        const [totalUsers, activeUsers, usersByRole, recentRegistrations, userGrowth, topActiveUsers,] = await Promise.all([
            // Total users
            database_1.default.user.count(),
            // Active users (logged in within last 30 days)
            database_1.default.user.count({
                where: {
                    lastLogin: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    },
                },
            }),
            // Users by role
            database_1.default.user.groupBy({
                by: ["role"],
                _count: true,
            }),
            // Recent registrations (last 7 days)
            database_1.default.user.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    },
                },
            }),
            // User growth over time (last 30 days)
            this.getUserGrowthData(30),
            // Top active users
            database_1.default.user.findMany({
                take: 10,
                orderBy: { lastLogin: "desc" },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    lastLogin: true,
                    _count: {
                        select: {
                            sentMessages: true,
                            receivedMessages: true,
                            notifications: true,
                        },
                    },
                },
            }),
        ]);
        return {
            totalUsers,
            activeUsers,
            usersByRole: usersByRole.map((item) => ({
                role: item.role,
                count: item._count,
            })),
            recentRegistrations,
            userGrowth,
            topActiveUsers,
        };
    }
    // Get fleet analytics
    static async getFleetAnalytics(dateRange) {
        const [totalBuses, activeBuses, busesByStatus, averageUtilization, maintenanceRequired, fuelData, distanceData,] = await Promise.all([
            // Total buses
            database_1.default.bus.count(),
            // Active buses (with drivers assigned)
            database_1.default.bus.count({
                where: {
                    driverId: {
                        not: null,
                    },
                },
            }),
            // Buses by status (assuming we have status field, otherwise use active)
            database_1.default.bus.groupBy({
                by: ["isActive"],
                _count: true,
            }),
            // Average utilization (placeholder - would need trip data)
            this.calculateAverageUtilization(),
            // Maintenance required (placeholder)
            database_1.default.bus.count({
                where: {
                // Add maintenance logic here
                },
            }),
            // Fuel efficiency data (placeholder)
            this.getFuelEfficiencyData(),
            // Distance traveled (placeholder)
            this.getDistanceTraveledData(),
        ]);
        return {
            totalBuses,
            activeBuses,
            busesByStatus: busesByStatus.map((item) => ({
                status: item.isActive ? "Active" : "Inactive",
                count: item._count,
            })),
            averageBusUtilization: averageUtilization,
            maintenanceRequired,
            fuelEfficiency: fuelData.averageEfficiency,
            distanceTraveled: distanceData.totalDistance,
        };
    }
    // Get safety analytics
    static async getSafetyAnalytics(dateRange) {
        const where = {};
        if (dateRange) {
            where.createdAt = {
                gte: dateRange.start,
                lte: dateRange.end,
            };
        }
        const [totalAlerts, activeAlerts, alertsByType, alertsBySeverity, resolvedToday, avgResponseTime,] = await Promise.all([
            // Total alerts
            database_1.default.emergencyAlert.count({ where }),
            // Active alerts
            database_1.default.emergencyAlert.count({
                where: { ...where, resolved: false },
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
            // Resolved today
            database_1.default.emergencyAlert.count({
                where: {
                    ...where,
                    resolved: true,
                    resolvedAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    },
                },
            }),
            // Average response time (placeholder)
            this.calculateAverageResponseTime(),
        ]);
        // Calculate safety score (lower alerts = higher score)
        const safetyScore = Math.max(0, 100 - activeAlerts * 2 - totalAlerts * 0.5);
        return {
            totalAlerts,
            activeAlerts,
            alertsByType: alertsByType.map((item) => ({
                type: item.type,
                count: item._count,
            })),
            alertsBySeverity: alertsBySeverity.map((item) => ({
                severity: item.severity,
                count: item._count,
            })),
            resolvedToday,
            averageResponseTime: avgResponseTime,
            safetyScore: Math.round(safetyScore),
        };
    }
    // Get communication analytics
    static async getCommunicationAnalytics(dateRange) {
        const where = {};
        if (dateRange) {
            where.sentAt = {
                gte: dateRange.start,
                lte: dateRange.end,
            };
        }
        const [totalMessages, messagesToday, unreadMessages, conversationsByType, mostActiveUsers, responseRate,] = await Promise.all([
            // Total messages
            database_1.default.message.count(),
            // Messages today
            database_1.default.message.count({
                where: {
                    sentAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    },
                },
            }),
            // Unread messages
            database_1.default.message.count({
                where: { isRead: false },
            }),
            // Conversations by type
            database_1.default.message.groupBy({
                by: ["type"],
                _count: true,
            }),
            // Most active users
            database_1.default.user.findMany({
                take: 10,
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    _count: {
                        select: {
                            sentMessages: true,
                            receivedMessages: true,
                        },
                    },
                },
                orderBy: {
                    sentMessages: {
                        _count: "desc",
                    },
                },
            }),
            // Response rate (placeholder)
            this.calculateResponseRate(),
        ]);
        return {
            totalMessages,
            messagesToday,
            unreadMessages,
            conversationsByType: conversationsByType.map((item) => ({
                type: item.type,
                count: item._count,
            })),
            mostActiveUsers,
            responseRate,
        };
    }
    // Get performance metrics
    static async getPerformanceMetrics() {
        // This would integrate with monitoring tools like New Relic, DataDog, etc.
        // For now, return placeholder data
        return {
            apiResponseTime: 150, // ms
            databaseQueryTime: 25, // ms
            cacheHitRate: 85, // %
            errorRate: 0.5, // %
            throughput: 1250, // requests/minute
            memoryUsage: 75, // %
        };
    }
    // Get complete dashboard data
    static async getDashboardData(filters) {
        const [overview, userAnalytics, fleetAnalytics, safetyAnalytics, communicationAnalytics, performanceMetrics, recentActivities,] = await Promise.all([
            this.getSystemOverview(),
            this.getUserAnalytics(filters?.dateRange),
            this.getFleetAnalytics(filters?.dateRange),
            this.getSafetyAnalytics(filters?.dateRange),
            this.getCommunicationAnalytics(filters?.dateRange),
            this.getPerformanceMetrics(),
            this.getRecentActivities(20),
        ]);
        return {
            overview,
            userAnalytics,
            fleetAnalytics,
            safetyAnalytics,
            communicationAnalytics,
            performanceMetrics,
            recentActivities,
        };
    }
    // Get recent activities
    static async getRecentActivities(limit = 20) {
        const activities = [];
        // Get recent alerts
        const recentAlerts = await database_1.default.emergencyAlert.findMany({
            take: Math.ceil(limit / 4),
            orderBy: { createdAt: "desc" },
            include: {
                bus: { select: { plateNumber: true } },
            },
        });
        // Get recent messages
        const recentMessages = await database_1.default.message.findMany({
            take: Math.ceil(limit / 4),
            orderBy: { sentAt: "desc" },
            include: {
                sender: { select: { firstName: true, lastName: true, role: true } },
            },
        });
        // Get recent trips
        const recentTrips = await database_1.default.trip.findMany({
            take: Math.ceil(limit / 4),
            orderBy: { createdAt: "desc" },
            include: {
                bus: { select: { plateNumber: true } },
                driver: {
                    select: {
                        user: { select: { firstName: true, lastName: true } },
                    },
                },
            },
        });
        // Get recent user registrations
        const recentUsers = await database_1.default.user.findMany({
            take: Math.ceil(limit / 4),
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
            },
        });
        // Combine and sort all activities
        activities.push(...recentAlerts.map((alert) => ({
            type: "ALERT",
            title: `${alert.type} Alert`,
            description: alert.description,
            timestamp: alert.createdAt,
            metadata: {
                bus: alert.bus?.plateNumber,
                severity: alert.severity,
            },
        })), ...recentMessages.map((message) => ({
            type: "MESSAGE",
            title: "New Message",
            description: `${message.sender.firstName} ${message.sender.lastName} sent a message`,
            timestamp: message.sentAt,
            metadata: {
                sender: message.sender,
                type: message.type,
            },
        })), ...recentTrips.map((trip) => ({
            type: "TRIP",
            title: "Trip Started",
            description: `Trip started for bus ${trip.bus?.plateNumber}`,
            timestamp: trip.createdAt,
            metadata: {
                bus: trip.bus?.plateNumber,
                driver: trip.driver?.user,
                status: trip.status,
            },
        })), ...recentUsers.map((user) => ({
            type: "USER",
            title: "New User Registration",
            description: `${user.firstName} ${user.lastName} registered as ${user.role}`,
            timestamp: user.createdAt,
            metadata: {
                role: user.role,
            },
        })));
        // Sort by timestamp and limit
        return activities
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
    }
    // Get detailed reports
    static async getDetailedReport(reportType, filters) {
        switch (reportType) {
            case "users":
                return this.getUserDetailedReport(filters);
            case "fleet":
                return this.getFleetDetailedReport(filters);
            case "safety":
                return this.getSafetyDetailedReport(filters);
            case "communication":
                return this.getCommunicationDetailedReport(filters);
            case "financial":
                return this.getFinancialDetailedReport(filters);
            default:
                throw new errorHandler_1.CustomError("Invalid report type", 400);
        }
    }
    // Export data for external systems
    static async exportData(dataType, format, filters) {
        let data = [];
        let filename;
        switch (dataType) {
            case "users":
                data = await database_1.default.user.findMany({
                    where: filters?.schoolId
                        ? { schoolStaff: { schoolId: filters.schoolId } }
                        : {},
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        role: true,
                        isActive: true,
                        createdAt: true,
                        lastLogin: true,
                    },
                });
                filename = "users_export";
                break;
            case "buses":
                data = await database_1.default.bus.findMany({
                    where: filters?.schoolId ? { schoolId: filters.schoolId } : {},
                    include: {
                        driver: {
                            select: {
                                user: {
                                    select: {
                                        firstName: true,
                                        lastName: true,
                                    },
                                },
                            },
                        },
                        school: {
                            select: {
                                name: true,
                            },
                        },
                    },
                });
                filename = "buses_export";
                break;
            case "students":
                data = await database_1.default.student.findMany({
                    where: filters?.schoolId ? { schoolId: filters.schoolId } : {},
                    include: {
                        parent: {
                            select: {
                                user: {
                                    select: {
                                        firstName: true,
                                        lastName: true,
                                    },
                                },
                            },
                        },
                        school: {
                            select: {
                                name: true,
                            },
                        },
                    },
                });
                filename = "students_export";
                break;
            case "trips":
                data = await database_1.default.trip.findMany({
                    where: {
                        ...(filters?.schoolId && { bus: { schoolId: filters.schoolId } }),
                        ...(filters?.dateRange && {
                            createdAt: {
                                gte: filters.dateRange.start,
                                lte: filters.dateRange.end,
                            },
                        }),
                    },
                    include: {
                        bus: {
                            select: {
                                plateNumber: true,
                            },
                        },
                        driver: {
                            select: {
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
                filename = "trips_export";
                break;
            case "alerts":
                data = await database_1.default.emergencyAlert.findMany({
                    where: {
                        ...(filters?.schoolId && { bus: { schoolId: filters.schoolId } }),
                        ...(filters?.dateRange && {
                            createdAt: {
                                gte: filters.dateRange.start,
                                lte: filters.dateRange.end,
                            },
                        }),
                    },
                    include: {
                        bus: {
                            select: {
                                plateNumber: true,
                            },
                        },
                        driver: {
                            select: {
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
                filename = "alerts_export";
                break;
            default:
                throw new errorHandler_1.CustomError("Invalid data type", 400);
        }
        return {
            data,
            filename: `${filename}_${new Date().toISOString().split("T")[0]}.${format}`,
            format,
        };
    }
    // System maintenance functions
    static async runSystemMaintenance() {
        const [cleanedUsers, cleanedMessages, cleanedNotifications] = await Promise.all([
            // Remove inactive users older than 2 years
            database_1.default.user.deleteMany({
                where: {
                    isActive: false,
                    lastLogin: {
                        lt: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000),
                    },
                },
            }),
            // Clean old messages (older than 90 days)
            database_1.default.message.deleteMany({
                where: {
                    sentAt: {
                        lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
                    },
                    isRead: true,
                },
            }),
            // Clean old notifications (older than 30 days)
            database_1.default.notification.deleteMany({
                where: {
                    sentAt: {
                        lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    },
                    isRead: true,
                },
            }),
        ]);
        // Database optimization (placeholder)
        const optimizedDatabase = true;
        return {
            cleanedUsers: cleanedUsers.count,
            cleanedMessages: cleanedMessages.count,
            cleanedNotifications: cleanedNotifications.count,
            optimizedDatabase,
        };
    }
    // Get system settings
    static async getSystemSettings() {
        // This would retrieve settings from a settings table
        // For now, return default settings
        return {
            notifications: {
                emailEnabled: true,
                smsEnabled: false,
                pushEnabled: true,
            },
            safety: {
                autoResolveAlerts: false,
                emergencyResponseTime: 300, // seconds
                geofenceRadius: 100, // meters
            },
            system: {
                maintenanceMode: false,
                maxFileSize: 10 * 1024 * 1024, // 10MB
                sessionTimeout: 24 * 60 * 60, // 24 hours
            },
        };
    }
    // Update system settings
    static async updateSystemSettings(settings) {
        // This would update settings in database
        // For now, just return the settings
        return settings;
    }
    // Private helper methods
    static async getSystemHealth() {
        const activeAlerts = await database_1.default.emergencyAlert.count({
            where: { resolved: false },
        });
        const criticalAlerts = await database_1.default.emergencyAlert.count({
            where: {
                resolved: false,
                severity: "CRITICAL",
            },
        });
        if (criticalAlerts > 0)
            return "CRITICAL";
        if (activeAlerts > 10)
            return "WARNING";
        return "GOOD";
    }
    static async getUserGrowthData(days) {
        const data = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const startOfDay = new Date(date.setHours(0, 0, 0, 0));
            const endOfDay = new Date(date.setHours(23, 59, 59, 999));
            const count = await database_1.default.user.count({
                where: {
                    createdAt: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                },
            });
            data.push({
                date: startOfDay.toISOString().split("T")[0],
                count,
            });
        }
        return data;
    }
    static async calculateAverageUtilization() {
        // Placeholder calculation
        // In real implementation, calculate based on trip data and bus capacity
        return 75.5; // percentage
    }
    static async getFuelEfficiencyData() {
        // Placeholder data
        return { averageEfficiency: 12.5 }; // km/liter
    }
    static async getDistanceTraveledData() {
        // Placeholder data
        return { totalDistance: 15420.5 }; // km
    }
    static async calculateAverageResponseTime() {
        // Placeholder calculation
        // Would calculate based on time between alert creation and resolution
        return 450; // seconds
    }
    static async calculateResponseRate() {
        // Placeholder calculation
        return 89.5; // percentage
    }
    // Detailed report methods
    static async getUserDetailedReport(filters) {
        // Implementation for detailed user report
        return {
            summary: await this.getUserAnalytics(filters?.dateRange),
            detailedBreakdown: {},
        };
    }
    static async getFleetDetailedReport(filters) {
        // Implementation for detailed fleet report
        return {
            summary: await this.getFleetAnalytics(filters?.dateRange),
            detailedBreakdown: {},
        };
    }
    static async getSafetyDetailedReport(filters) {
        // Implementation for detailed safety report
        return {
            summary: await this.getSafetyAnalytics(filters?.dateRange),
            detailedBreakdown: {},
        };
    }
    static async getCommunicationDetailedReport(filters) {
        // Implementation for detailed communication report
        return {
            summary: await this.getCommunicationAnalytics(filters?.dateRange),
            detailedBreakdown: {},
        };
    }
    static async getFinancialDetailedReport(filters) {
        // Implementation for detailed financial report
        return {
            totalRevenue: 0,
            monthlyRevenue: 0,
            outstandingPayments: 0,
            revenueBreakdown: [],
        };
    }
    // School management methods
    static async createSchool(schoolData) {
        // Check if school with same name and address already exists
        const existingSchool = await database_1.default.school.findFirst({
            where: {
                name: schoolData.name,
                address: schoolData.address,
                city: schoolData.city,
                state: schoolData.state,
            },
        });
        if (existingSchool) {
            throw new errorHandler_1.CustomError("School with this name and address already exists", 409);
        }
        // Check if email is provided and unique
        if (schoolData.email) {
            const existingEmail = await database_1.default.school.findFirst({
                where: { email: schoolData.email },
            });
            if (existingEmail) {
                throw new errorHandler_1.CustomError("School with this email already exists", 409);
            }
        }
        const school = await database_1.default.school.create({
            data: {
                name: schoolData.name,
                address: schoolData.address,
                city: schoolData.city,
                state: schoolData.state,
                zipCode: schoolData.zipCode,
                country: schoolData.country || "US",
                phone: schoolData.phone,
                email: schoolData.email,
                latitude: schoolData.latitude,
                longitude: schoolData.longitude,
                timezone: schoolData.timezone || "America/New_York",
            },
            include: {
                _count: {
                    select: {
                        buses: true,
                        students: true,
                        staff: true,
                    },
                },
            },
        });
        return school;
    }
    static async updateSchool(schoolId, schoolData) {
        // Check if school exists
        const existingSchool = await database_1.default.school.findUnique({
            where: { id: schoolId },
        });
        if (!existingSchool) {
            throw new errorHandler_1.CustomError("School not found", 404);
        }
        // Check if email is provided and unique (if different from current)
        if (schoolData.email && schoolData.email !== existingSchool.email) {
            const existingEmail = await database_1.default.school.findFirst({
                where: {
                    email: schoolData.email,
                    id: { not: schoolId },
                },
            });
            if (existingEmail) {
                throw new errorHandler_1.CustomError("School with this email already exists", 409);
            }
        }
        // Check if name and address combination is unique (if different from current)
        if ((schoolData.name && schoolData.name !== existingSchool.name) ||
            (schoolData.address && schoolData.address !== existingSchool.address) ||
            (schoolData.city && schoolData.city !== existingSchool.city) ||
            (schoolData.state && schoolData.state !== existingSchool.state)) {
            const existingSchoolData = await database_1.default.school.findFirst({
                where: {
                    name: schoolData.name || existingSchool.name,
                    address: schoolData.address || existingSchool.address,
                    city: schoolData.city || existingSchool.city,
                    state: schoolData.state || existingSchool.state,
                    id: { not: schoolId },
                },
            });
            if (existingSchoolData) {
                throw new errorHandler_1.CustomError("School with this name and address already exists", 409);
            }
        }
        const school = await database_1.default.school.update({
            where: { id: schoolId },
            data: {
                ...schoolData,
                updatedAt: new Date(),
            },
            include: {
                _count: {
                    select: {
                        buses: true,
                        students: true,
                        staff: true,
                    },
                },
            },
        });
        return school;
    }
    static async deleteSchool(schoolId) {
        // Check if school exists
        const existingSchool = await database_1.default.school.findUnique({
            where: { id: schoolId },
            include: {
                _count: {
                    select: {
                        buses: true,
                        students: true,
                        staff: true,
                    },
                },
            },
        });
        if (!existingSchool) {
            throw new errorHandler_1.CustomError("School not found", 404);
        }
        // Check if school has associated data
        const hasAssociatedData = existingSchool._count.buses > 0 ||
            existingSchool._count.students > 0 ||
            existingSchool._count.staff > 0;
        if (hasAssociatedData) {
            throw new errorHandler_1.CustomError("Cannot delete school with associated buses, students, or staff. Please remove all associated data first.", 409);
        }
        await database_1.default.school.delete({
            where: { id: schoolId },
        });
    }
    static async getSchoolById(schoolId) {
        const school = await database_1.default.school.findUnique({
            where: { id: schoolId },
            include: {
                _count: {
                    select: {
                        buses: true,
                        students: true,
                        staff: true,
                    },
                },
            },
        });
        if (!school) {
            throw new errorHandler_1.CustomError("School not found", 404);
        }
        return school;
    }
}
exports.AdminService = AdminService;
//# sourceMappingURL=adminService.js.map