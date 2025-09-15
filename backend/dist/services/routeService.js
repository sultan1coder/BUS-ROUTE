"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteService = void 0;
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middleware/errorHandler");
class RouteService {
    // Create a new route
    static async createRoute(routeData) {
        // Verify school exists
        const school = await database_1.default.school.findUnique({
            where: { id: routeData.schoolId },
        });
        if (!school) {
            throw new errorHandler_1.CustomError("School not found", 404);
        }
        // Check if bus is available (if provided)
        if (routeData.busId) {
            const bus = await database_1.default.bus.findUnique({
                where: { id: routeData.busId },
                include: { school: true },
            });
            if (!bus || !bus.isActive) {
                throw new errorHandler_1.CustomError("Bus not found or inactive", 404);
            }
            if (bus.schoolId !== routeData.schoolId) {
                throw new errorHandler_1.CustomError("Bus belongs to a different school", 400);
            }
            // Check if bus is already assigned to another route
            const existingRoute = await database_1.default.route.findFirst({
                where: {
                    busId: routeData.busId,
                    isActive: true,
                },
            });
            if (existingRoute) {
                throw new errorHandler_1.CustomError("Bus is already assigned to another route", 400);
            }
        }
        return await database_1.default.route.create({
            data: routeData,
            include: {
                school: {
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
                stops: {
                    orderBy: {
                        sequence: "asc",
                    },
                },
                _count: {
                    select: {
                        assignments: true,
                    },
                },
            },
        });
    }
    // Get route by ID with full details
    static async getRouteById(routeId) {
        const route = await database_1.default.route.findUnique({
            where: { id: routeId },
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
                bus: {
                    select: {
                        id: true,
                        plateNumber: true,
                        model: true,
                        capacity: true,
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
                },
                stops: {
                    where: { isActive: true },
                    orderBy: { sequence: "asc" },
                    include: {
                        assignments: {
                            include: {
                                student: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                        grade: true,
                                    },
                                },
                            },
                        },
                    },
                },
                assignments: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                grade: true,
                            },
                        },
                        stop: {
                            select: {
                                id: true,
                                name: true,
                                address: true,
                            },
                        },
                    },
                },
                trips: {
                    where: {
                        status: { in: ["COMPLETED", "IN_PROGRESS"] },
                    },
                    orderBy: {
                        scheduledStart: "desc",
                    },
                    take: 5,
                },
                _count: {
                    select: {
                        assignments: true,
                        stops: true,
                        trips: true,
                    },
                },
            },
        });
        if (!route) {
            throw new errorHandler_1.CustomError("Route not found", 404);
        }
        return route;
    }
    // Get all routes with filtering and pagination
    static async getRoutes(filters = {}, page = 1, limit = 10) {
        const { schoolId, isActive, hasBus, search } = filters;
        const skip = (page - 1) * limit;
        const where = {};
        if (schoolId) {
            where.schoolId = schoolId;
        }
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
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                {
                    bus: {
                        plateNumber: { contains: search, mode: "insensitive" },
                    },
                },
            ];
        }
        const [routes, total] = await Promise.all([
            database_1.default.route.findMany({
                where,
                include: {
                    school: {
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
                    stops: {
                        where: { isActive: true },
                        select: {
                            id: true,
                            name: true,
                            sequence: true,
                        },
                        orderBy: { sequence: "asc" },
                    },
                    _count: {
                        select: {
                            assignments: true,
                            stops: true,
                        },
                    },
                },
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            database_1.default.route.count({ where }),
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            routes,
            total,
            page,
            limit,
            totalPages,
        };
    }
    // Update route
    static async updateRoute(routeId, updateData) {
        const existingRoute = await database_1.default.route.findUnique({
            where: { id: routeId },
            include: { school: true },
        });
        if (!existingRoute) {
            throw new errorHandler_1.CustomError("Route not found", 404);
        }
        // Check bus availability if being assigned
        if (updateData.busId) {
            const bus = await database_1.default.bus.findUnique({
                where: { id: updateData.busId },
                include: { school: true },
            });
            if (!bus || !bus.isActive) {
                throw new errorHandler_1.CustomError("Bus not found or inactive", 404);
            }
            if (bus.schoolId !== existingRoute.schoolId) {
                throw new errorHandler_1.CustomError("Bus belongs to a different school", 400);
            }
            // Check if bus is already assigned to another route
            if (updateData.busId !== existingRoute.busId) {
                const existingAssignment = await database_1.default.route.findFirst({
                    where: {
                        busId: updateData.busId,
                        isActive: true,
                        id: { not: routeId },
                    },
                });
                if (existingAssignment) {
                    throw new errorHandler_1.CustomError("Bus is already assigned to another route", 400);
                }
            }
        }
        return await database_1.default.route.update({
            where: { id: routeId },
            data: updateData,
            include: {
                school: {
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
                stops: {
                    where: { isActive: true },
                    orderBy: { sequence: "asc" },
                },
            },
        });
    }
    // Delete route (soft delete)
    static async deleteRoute(routeId) {
        const route = await database_1.default.route.findUnique({
            where: { id: routeId },
            include: {
                trips: {
                    where: {
                        status: { in: ["SCHEDULED", "IN_PROGRESS"] },
                    },
                },
            },
        });
        if (!route) {
            throw new errorHandler_1.CustomError("Route not found", 404);
        }
        // Check for active trips
        if (route.trips.length > 0) {
            throw new errorHandler_1.CustomError("Cannot delete route with active trips", 400);
        }
        await database_1.default.route.update({
            where: { id: routeId },
            data: { isActive: false },
        });
    }
    // Create route stop
    static async createRouteStop(stopData) {
        // Verify route exists and is active
        const route = await database_1.default.route.findUnique({
            where: { id: stopData.routeId },
        });
        if (!route || !route.isActive) {
            throw new errorHandler_1.CustomError("Route not found or inactive", 404);
        }
        // Check if sequence number is unique for this route
        const existingStop = await database_1.default.routeStop.findFirst({
            where: {
                routeId: stopData.routeId,
                sequence: stopData.sequence,
                isActive: true,
            },
        });
        if (existingStop) {
            throw new errorHandler_1.CustomError("Sequence number already exists for this route", 409);
        }
        return await database_1.default.routeStop.create({
            data: stopData,
            include: {
                route: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }
    // Update route stop
    static async updateRouteStop(stopId, updateData) {
        const existingStop = await database_1.default.routeStop.findUnique({
            where: { id: stopId },
            include: { route: true },
        });
        if (!existingStop) {
            throw new errorHandler_1.CustomError("Route stop not found", 404);
        }
        // Check sequence uniqueness if being updated
        if (updateData.sequence !== undefined &&
            updateData.sequence !== existingStop.sequence) {
            const sequenceCheck = await database_1.default.routeStop.findFirst({
                where: {
                    routeId: existingStop.routeId,
                    sequence: updateData.sequence,
                    isActive: true,
                    id: { not: stopId },
                },
            });
            if (sequenceCheck) {
                throw new errorHandler_1.CustomError("Sequence number already exists for this route", 409);
            }
        }
        return await database_1.default.routeStop.update({
            where: { id: stopId },
            data: updateData,
            include: {
                route: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                assignments: {
                    include: {
                        student: {
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
    }
    // Delete route stop
    static async deleteRouteStop(stopId) {
        const stop = await database_1.default.routeStop.findUnique({
            where: { id: stopId },
            include: {
                assignments: true,
            },
        });
        if (!stop) {
            throw new errorHandler_1.CustomError("Route stop not found", 404);
        }
        // Check if stop has active assignments
        if (stop.assignments.length > 0) {
            throw new errorHandler_1.CustomError("Cannot delete stop with active student assignments", 400);
        }
        await database_1.default.routeStop.update({
            where: { id: stopId },
            data: { isActive: false },
        });
    }
    // Assign student to route and stop
    static async assignStudentToRoute(assignmentData) {
        const { studentId, routeId, stopId } = assignmentData;
        // Verify student exists and belongs to the route's school
        const student = await database_1.default.student.findUnique({
            where: { id: studentId },
            include: { school: true },
        });
        if (!student || !student.isActive) {
            throw new errorHandler_1.CustomError("Student not found or inactive", 404);
        }
        // Verify route exists and belongs to the same school
        const route = await database_1.default.route.findUnique({
            where: { id: routeId },
            include: { school: true },
        });
        if (!route || !route.isActive) {
            throw new errorHandler_1.CustomError("Route not found or inactive", 404);
        }
        if (route.schoolId !== student.schoolId) {
            throw new errorHandler_1.CustomError("Student and route belong to different schools", 400);
        }
        // Verify stop belongs to the route
        const stop = await database_1.default.routeStop.findUnique({
            where: { id: stopId },
        });
        if (!stop || !stop.isActive || stop.routeId !== routeId) {
            throw new errorHandler_1.CustomError("Route stop not found or doesn't belong to this route", 404);
        }
        // Check if student is already assigned to this route
        const existingAssignment = await database_1.default.studentRouteAssignment.findFirst({
            where: {
                studentId,
                routeId,
                isActive: true,
            },
        });
        if (existingAssignment) {
            // Update existing assignment
            return await database_1.default.studentRouteAssignment.update({
                where: { id: existingAssignment.id },
                data: { stopId },
                include: {
                    student: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            grade: true,
                        },
                    },
                    route: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    stop: {
                        select: {
                            id: true,
                            name: true,
                            address: true,
                        },
                    },
                },
            });
        }
        // Create new assignment
        return await database_1.default.studentRouteAssignment.create({
            data: {
                studentId,
                routeId,
                stopId,
            },
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        grade: true,
                    },
                },
                route: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                stop: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                    },
                },
            },
        });
    }
    // Unassign student from route
    static async unassignStudentFromRoute(studentId, routeId) {
        const assignment = await database_1.default.studentRouteAssignment.findFirst({
            where: {
                studentId,
                routeId,
                isActive: true,
            },
        });
        if (!assignment) {
            throw new errorHandler_1.CustomError("Student is not assigned to this route", 404);
        }
        await database_1.default.studentRouteAssignment.update({
            where: { id: assignment.id },
            data: { isActive: false },
        });
    }
    // Get route statistics
    static async getRouteStats(routeId) {
        const route = await database_1.default.route.findUnique({
            where: { id: routeId },
            include: {
                stops: {
                    where: { isActive: true },
                },
                assignments: {
                    where: { isActive: true },
                },
                trips: true,
            },
        });
        if (!route) {
            throw new errorHandler_1.CustomError("Route not found", 404);
        }
        const totalStops = route.stops.length;
        const totalStudents = route.assignments.length;
        const totalTrips = route.trips.length;
        const completedTrips = route.trips.filter((trip) => trip.status === "COMPLETED").length;
        // Calculate average trip duration (in minutes)
        const completedTripsWithDuration = route.trips.filter((trip) => trip.status === "COMPLETED" && trip.actualStart && trip.actualEnd);
        const averageTripDuration = completedTripsWithDuration.length > 0
            ? completedTripsWithDuration.reduce((sum, trip) => {
                const duration = new Date(trip.actualEnd).getTime() -
                    new Date(trip.actualStart).getTime();
                return sum + duration / (1000 * 60); // Convert to minutes
            }, 0) / completedTripsWithDuration.length
            : 0;
        // Calculate total distance
        const routeDistance = route.trips.reduce((sum, trip) => sum + (trip.distance || 0), 0);
        return {
            totalStops,
            totalStudents,
            totalTrips,
            completedTrips,
            averageTripDuration: Math.round(averageTripDuration * 10) / 10, // Round to 1 decimal
            routeDistance: Math.round(routeDistance * 10) / 10, // Round to 1 decimal
        };
    }
    // Get routes by school
    static async getRoutesBySchool(schoolId) {
        return await database_1.default.route.findMany({
            where: {
                schoolId,
                isActive: true,
            },
            include: {
                bus: {
                    select: {
                        id: true,
                        plateNumber: true,
                        model: true,
                    },
                },
                stops: {
                    where: { isActive: true },
                    select: {
                        id: true,
                        name: true,
                        sequence: true,
                    },
                    orderBy: { sequence: "asc" },
                },
                _count: {
                    select: {
                        assignments: true,
                    },
                },
            },
            orderBy: { name: "asc" },
        });
    }
    // Get student route assignments
    static async getStudentAssignments(studentId) {
        return await database_1.default.studentRouteAssignment.findMany({
            where: {
                studentId,
                isActive: true,
            },
            include: {
                route: {
                    select: {
                        id: true,
                        name: true,
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
                },
                stop: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                        latitude: true,
                        longitude: true,
                    },
                },
            },
        });
    }
    // Reorder route stops
    static async reorderRouteStops(routeId, stopOrders) {
        // Verify route exists
        const route = await database_1.default.route.findUnique({
            where: { id: routeId },
        });
        if (!route) {
            throw new errorHandler_1.CustomError("Route not found", 404);
        }
        // Update sequences in transaction
        const updates = stopOrders.map(({ stopId, sequence }) => database_1.default.routeStop.updateMany({
            where: {
                id: stopId,
                routeId,
            },
            data: { sequence },
        }));
        await database_1.default.$transaction(updates);
        // Return updated stops
        return await database_1.default.routeStop.findMany({
            where: {
                routeId,
                isActive: true,
            },
            orderBy: { sequence: "asc" },
        });
    }
}
exports.RouteService = RouteService;
//# sourceMappingURL=routeService.js.map