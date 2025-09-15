"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverService = void 0;
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middleware/errorHandler");
class DriverService {
    // Create a new driver profile
    static async createDriver(driverData) {
        // Check if user exists and is active
        const user = await database_1.default.user.findUnique({
            where: { id: driverData.userId },
        });
        if (!user || !user.isActive) {
            throw new errorHandler_1.CustomError("User not found or inactive", 404);
        }
        if (user.role !== "DRIVER") {
            throw new errorHandler_1.CustomError("User must have DRIVER role", 400);
        }
        // Check if driver profile already exists for this user
        const existingDriver = await database_1.default.driver.findUnique({
            where: { userId: driverData.userId },
        });
        if (existingDriver) {
            throw new errorHandler_1.CustomError("Driver profile already exists for this user", 409);
        }
        // Check if license number is already in use
        const existingLicense = await database_1.default.driver.findUnique({
            where: { licenseNumber: driverData.licenseNumber },
        });
        if (existingLicense) {
            throw new errorHandler_1.CustomError("License number is already registered", 409);
        }
        // Validate license expiry date
        if (driverData.licenseExpiry <= new Date()) {
            throw new errorHandler_1.CustomError("License expiry date must be in the future", 400);
        }
        return await database_1.default.driver.create({
            data: driverData,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                    },
                },
                bus: {
                    select: {
                        id: true,
                        plateNumber: true,
                        model: true,
                    },
                },
            },
        });
    }
    // Get driver by ID
    static async getDriverById(driverId) {
        return await database_1.default.driver.findUnique({
            where: { id: driverId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        avatar: true,
                    },
                },
                bus: {
                    select: {
                        id: true,
                        plateNumber: true,
                        model: true,
                        capacity: true,
                        school: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                trips: {
                    where: {
                        status: "COMPLETED",
                    },
                    select: {
                        id: true,
                        distance: true,
                        scheduledStart: true,
                        actualStart: true,
                        scheduledEnd: true,
                        actualEnd: true,
                    },
                    orderBy: {
                        scheduledStart: "desc",
                    },
                    take: 5, // Last 5 trips
                },
                performance: {
                    select: {
                        date: true,
                        rating: true,
                        incidents: true,
                        distanceDriven: true,
                        hoursDriven: true,
                    },
                    orderBy: {
                        date: "desc",
                    },
                    take: 30, // Last 30 days
                },
                _count: {
                    select: {
                        trips: true,
                    },
                },
            },
        });
    }
    // Get driver by user ID
    static async getDriverByUserId(userId) {
        return await database_1.default.driver.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        avatar: true,
                    },
                },
                bus: {
                    select: {
                        id: true,
                        plateNumber: true,
                        model: true,
                        capacity: true,
                        school: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });
    }
    // Get all drivers with filtering and pagination
    static async getDrivers(filters = {}, page = 1, limit = 10) {
        const { isActive, hasBus, search } = filters;
        const skip = (page - 1) * limit;
        const where = {};
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        if (hasBus !== undefined) {
            if (hasBus) {
                where.busId = { not: null };
            }
            else {
                where.busId = null;
            }
        }
        if (search) {
            where.OR = [
                {
                    user: {
                        firstName: { contains: search, mode: "insensitive" },
                    },
                },
                {
                    user: {
                        lastName: { contains: search, mode: "insensitive" },
                    },
                },
                {
                    user: {
                        email: { contains: search, mode: "insensitive" },
                    },
                },
                { licenseNumber: { contains: search, mode: "insensitive" } },
            ];
        }
        const [drivers, total] = await Promise.all([
            database_1.default.driver.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phone: true,
                        },
                    },
                    bus: {
                        select: {
                            id: true,
                            plateNumber: true,
                            model: true,
                        },
                    },
                },
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            database_1.default.driver.count({ where }),
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            drivers,
            total,
            page,
            limit,
            totalPages,
        };
    }
    // Update driver
    static async updateDriver(driverId, updateData) {
        // Check if driver exists
        const existingDriver = await database_1.default.driver.findUnique({
            where: { id: driverId },
        });
        if (!existingDriver) {
            throw new errorHandler_1.CustomError("Driver not found", 404);
        }
        // Check license number uniqueness if being updated
        if (updateData.licenseNumber &&
            updateData.licenseNumber !== existingDriver.licenseNumber) {
            const licenseCheck = await database_1.default.driver.findUnique({
                where: { licenseNumber: updateData.licenseNumber },
            });
            if (licenseCheck) {
                throw new errorHandler_1.CustomError("License number is already registered", 409);
            }
        }
        // Validate license expiry date if being updated
        if (updateData.licenseExpiry && updateData.licenseExpiry <= new Date()) {
            throw new errorHandler_1.CustomError("License expiry date must be in the future", 400);
        }
        return await database_1.default.driver.update({
            where: { id: driverId },
            data: updateData,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                    },
                },
                bus: {
                    select: {
                        id: true,
                        plateNumber: true,
                        model: true,
                    },
                },
            },
        });
    }
    // Delete driver (soft delete)
    static async deleteDriver(driverId) {
        const driver = await database_1.default.driver.findUnique({
            where: { id: driverId },
            include: { bus: true },
        });
        if (!driver) {
            throw new errorHandler_1.CustomError("Driver not found", 404);
        }
        // Check if driver is currently assigned to a bus
        if (driver.bus) {
            throw new errorHandler_1.CustomError("Cannot delete driver currently assigned to a bus", 400);
        }
        // Check if driver has active trips
        const activeTrips = await database_1.default.trip.findMany({
            where: {
                driverId,
                status: { in: ["SCHEDULED", "IN_PROGRESS"] },
            },
        });
        if (activeTrips.length > 0) {
            throw new errorHandler_1.CustomError("Cannot delete driver with active trips", 400);
        }
        await database_1.default.driver.update({
            where: { id: driverId },
            data: { isActive: false },
        });
    }
    // Assign driver to bus (update bus assignment)
    static async assignToBus(driverId, busId) {
        // Check if driver exists and is active
        const driver = await database_1.default.driver.findUnique({
            where: { id: driverId },
            include: { bus: true },
        });
        if (!driver || !driver.isActive) {
            throw new errorHandler_1.CustomError("Driver not found or inactive", 404);
        }
        // Check if bus exists and is active
        const bus = await database_1.default.bus.findUnique({
            where: { id: busId },
        });
        if (!bus || !bus.isActive) {
            throw new errorHandler_1.CustomError("Bus not found or inactive", 404);
        }
        // Check if bus already has a driver
        if (bus.driverId && bus.driverId !== driverId) {
            throw new errorHandler_1.CustomError("Bus is already assigned to another driver", 400);
        }
        // Check if driver is already assigned to another bus
        if (driver.bus && driver.bus.id !== busId) {
            throw new errorHandler_1.CustomError("Driver is already assigned to another bus", 400);
        }
        return await database_1.default.driver.update({
            where: { id: driverId },
            data: { bus: { connect: { id: busId } } },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                    },
                },
                bus: {
                    select: {
                        id: true,
                        plateNumber: true,
                        model: true,
                        capacity: true,
                        school: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });
    }
    // Unassign driver from bus
    static async unassignFromBus(driverId) {
        const driver = await database_1.default.driver.findUnique({
            where: { id: driverId },
        });
        if (!driver) {
            throw new errorHandler_1.CustomError("Driver not found", 404);
        }
        // Check if driver has active trips
        const activeTrips = await database_1.default.trip.findMany({
            where: {
                driverId,
                status: "IN_PROGRESS",
            },
        });
        if (activeTrips.length > 0) {
            throw new errorHandler_1.CustomError("Cannot unassign driver with active trips", 400);
        }
        return await database_1.default.driver.update({
            where: { id: driverId },
            data: { bus: { disconnect: true } },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                    },
                },
                bus: true,
            },
        });
    }
    // Get driver statistics
    static async getDriverStats(driverId) {
        const driver = await database_1.default.driver.findUnique({
            where: { id: driverId },
            include: {
                trips: {
                    select: {
                        id: true,
                        status: true,
                        distance: true,
                        scheduledStart: true,
                        actualStart: true,
                        scheduledEnd: true,
                        actualEnd: true,
                    },
                },
                bus: {
                    select: {
                        id: true,
                        plateNumber: true,
                        model: true,
                    },
                },
                performance: {
                    select: {
                        rating: true,
                        incidents: true,
                        distanceDriven: true,
                        hoursDriven: true,
                    },
                },
            },
        });
        if (!driver) {
            throw new errorHandler_1.CustomError("Driver not found", 404);
        }
        const totalTrips = driver.trips.length;
        const completedTrips = driver.trips.filter((trip) => trip.status === "COMPLETED").length;
        const activeTrips = driver.trips.filter((trip) => trip.status === "IN_PROGRESS").length;
        const totalDistance = driver.trips.reduce((sum, trip) => sum + (trip.distance || 0), 0);
        // Calculate total hours from performance data
        const totalHours = driver.performance.reduce((sum, perf) => sum + (perf.hoursDriven || 0), 0);
        // Calculate average rating
        const ratings = driver.performance
            .map((perf) => perf.rating)
            .filter((rating) => rating !== null);
        const averageRating = ratings.length > 0
            ? ratings.reduce((sum, rating) => sum + rating, 0) /
                ratings.length
            : 0;
        const totalIncidents = driver.performance.reduce((sum, perf) => sum + (perf.incidents || 0), 0);
        // Get recent trips (last 5)
        const recentTrips = driver.trips
            .sort((a, b) => new Date(b.scheduledStart).getTime() -
            new Date(a.scheduledStart).getTime())
            .slice(0, 5);
        return {
            totalTrips,
            completedTrips,
            activeTrips,
            totalDistance,
            totalHours,
            averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
            totalIncidents,
            currentBus: driver.bus,
            recentTrips,
        };
    }
    // Get available drivers (not assigned to any bus)
    static async getAvailableDrivers() {
        return await database_1.default.driver.findMany({
            where: {
                isActive: true,
                bus: null,
            },
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
            orderBy: {
                user: {
                    firstName: "asc",
                },
            },
        });
    }
    // Check if license is expiring soon (within 30 days)
    static async getDriversWithExpiringLicenses(daysAhead = 30) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + daysAhead);
        return await database_1.default.driver.findMany({
            where: {
                isActive: true,
                licenseExpiry: {
                    lte: futureDate,
                    gt: new Date(),
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    },
                },
            },
            orderBy: {
                licenseExpiry: "asc",
            },
        });
    }
}
exports.DriverService = DriverService;
//# sourceMappingURL=driverService.js.map