"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusService = void 0;
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middleware/errorHandler");
class BusService {
    // Create a new bus
    static async createBus(busData) {
        // Check if plate number already exists
        const existingBus = await database_1.default.bus.findUnique({
            where: { plateNumber: busData.plateNumber },
        });
        if (existingBus) {
            throw new errorHandler_1.CustomError("Bus with this plate number already exists", 409);
        }
        // Verify school exists
        const school = await database_1.default.school.findUnique({
            where: { id: busData.schoolId },
        });
        if (!school) {
            throw new errorHandler_1.CustomError("School not found", 404);
        }
        // Check if GPS device ID is already in use
        if (busData.gpsDeviceId) {
            const existingGPS = await database_1.default.bus.findUnique({
                where: { gpsDeviceId: busData.gpsDeviceId },
            });
            if (existingGPS) {
                throw new errorHandler_1.CustomError("GPS device ID is already in use", 409);
            }
        }
        return await database_1.default.bus.create({
            data: busData,
            include: {
                school: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
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
        });
    }
    // Get bus by ID
    static async getBusById(busId) {
        return await database_1.default.bus.findUnique({
            where: { id: busId },
            include: {
                school: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                        city: true,
                        state: true,
                    },
                },
                driver: {
                    select: {
                        id: true,
                        licenseNumber: true,
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                                phone: true,
                            },
                        },
                    },
                },
                routes: {
                    select: {
                        id: true,
                        name: true,
                        isActive: true,
                    },
                },
                geofences: {
                    select: {
                        id: true,
                        name: true,
                        latitude: true,
                        longitude: true,
                        radius: true,
                        isActive: true,
                    },
                },
                _count: {
                    select: {
                        trips: true,
                        trackingData: true,
                    },
                },
            },
        });
    }
    // Get all buses with filtering and pagination
    static async getBuses(filters = {}, page = 1, limit = 10) {
        const { schoolId, isActive, driverId, search } = filters;
        const skip = (page - 1) * limit;
        const where = {};
        if (schoolId) {
            where.schoolId = schoolId;
        }
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        if (driverId) {
            where.driverId = driverId;
        }
        if (search) {
            where.OR = [
                { plateNumber: { contains: search, mode: "insensitive" } },
                { model: { contains: search, mode: "insensitive" } },
                { color: { contains: search, mode: "insensitive" } },
            ];
        }
        const [buses, total] = await Promise.all([
            database_1.default.bus.findMany({
                where,
                include: {
                    school: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
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
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            database_1.default.bus.count({ where }),
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            buses,
            total,
            page,
            limit,
            totalPages,
        };
    }
    // Update bus
    static async updateBus(busId, updateData) {
        // Check if bus exists
        const existingBus = await database_1.default.bus.findUnique({
            where: { id: busId },
        });
        if (!existingBus) {
            throw new errorHandler_1.CustomError("Bus not found", 404);
        }
        // Check plate number uniqueness if being updated
        if (updateData.plateNumber &&
            updateData.plateNumber !== existingBus.plateNumber) {
            const plateCheck = await database_1.default.bus.findUnique({
                where: { plateNumber: updateData.plateNumber },
            });
            if (plateCheck) {
                throw new errorHandler_1.CustomError("Bus with this plate number already exists", 409);
            }
        }
        // Check GPS device ID uniqueness if being updated
        if (updateData.gpsDeviceId &&
            updateData.gpsDeviceId !== existingBus.gpsDeviceId) {
            const gpsCheck = await database_1.default.bus.findUnique({
                where: { gpsDeviceId: updateData.gpsDeviceId },
            });
            if (gpsCheck) {
                throw new errorHandler_1.CustomError("GPS device ID is already in use", 409);
            }
        }
        return await database_1.default.bus.update({
            where: { id: busId },
            data: updateData,
            include: {
                school: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
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
        });
    }
    // Delete bus (soft delete by setting isActive to false)
    static async deleteBus(busId) {
        const bus = await database_1.default.bus.findUnique({
            where: { id: busId },
        });
        if (!bus) {
            throw new errorHandler_1.CustomError("Bus not found", 404);
        }
        // Check if bus has active trips
        const activeTrips = await database_1.default.trip.findMany({
            where: {
                busId,
                status: { in: ["SCHEDULED", "IN_PROGRESS"] },
            },
        });
        if (activeTrips.length > 0) {
            throw new errorHandler_1.CustomError("Cannot delete bus with active trips", 400);
        }
        await database_1.default.bus.update({
            where: { id: busId },
            data: { isActive: false },
        });
    }
    // Assign driver to bus
    static async assignDriver(busId, driverId) {
        // Check if bus exists
        const bus = await database_1.default.bus.findUnique({
            where: { id: busId },
        });
        if (!bus) {
            throw new errorHandler_1.CustomError("Bus not found", 404);
        }
        // Check if driver exists and is active
        const driver = await database_1.default.driver.findUnique({
            where: { id: driverId },
            include: { user: true, bus: true },
        });
        if (!driver || !driver.isActive) {
            throw new errorHandler_1.CustomError("Driver not found or inactive", 404);
        }
        // Check if driver is already assigned to another bus
        if (driver.bus && driver.bus.id !== busId) {
            throw new errorHandler_1.CustomError("Driver is already assigned to another bus", 400);
        }
        return await database_1.default.bus.update({
            where: { id: busId },
            data: { driverId },
            include: {
                driver: {
                    select: {
                        id: true,
                        licenseNumber: true,
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                                phone: true,
                            },
                        },
                    },
                },
            },
        });
    }
    // Unassign driver from bus
    static async unassignDriver(busId) {
        const bus = await database_1.default.bus.findUnique({
            where: { id: busId },
        });
        if (!bus) {
            throw new errorHandler_1.CustomError("Bus not found", 404);
        }
        return await database_1.default.bus.update({
            where: { id: busId },
            data: { driverId: null },
            include: {
                driver: true,
            },
        });
    }
    // Get bus statistics
    static async getBusStats(busId) {
        const bus = await database_1.default.bus.findUnique({
            where: { id: busId },
            include: {
                trips: {
                    select: {
                        id: true,
                        status: true,
                        distance: true,
                    },
                },
                driver: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                                phone: true,
                            },
                        },
                    },
                },
            },
        });
        if (!bus) {
            throw new errorHandler_1.CustomError("Bus not found", 404);
        }
        const totalTrips = bus.trips.length;
        const completedTrips = bus.trips.filter((trip) => trip.status === "COMPLETED").length;
        const activeTrips = bus.trips.filter((trip) => trip.status === "IN_PROGRESS").length;
        const totalDistance = bus.trips.reduce((sum, trip) => sum + (trip.distance || 0), 0);
        // Get last location from tracking data
        const lastTracking = await database_1.default.gPSTracking.findFirst({
            where: { busId },
            orderBy: { timestamp: "desc" },
        });
        return {
            totalTrips,
            completedTrips,
            activeTrips,
            totalDistance,
            lastLocation: lastTracking
                ? {
                    latitude: lastTracking.latitude,
                    longitude: lastTracking.longitude,
                    timestamp: lastTracking.timestamp,
                }
                : undefined,
            currentDriver: bus.driver
                ? {
                    id: bus.driver.id,
                    firstName: bus.driver.user.firstName,
                    lastName: bus.driver.user.lastName,
                    phone: bus.driver.user.phone,
                }
                : undefined,
        };
    }
    // Get buses by school
    static async getBusesBySchool(schoolId) {
        return await database_1.default.bus.findMany({
            where: {
                schoolId,
                isActive: true,
            },
            include: {
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
            orderBy: { plateNumber: "asc" },
        });
    }
}
exports.BusService = BusService;
//# sourceMappingURL=busService.js.map