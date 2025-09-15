"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentService = void 0;
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middleware/errorHandler");
class StudentService {
    // Create a new student
    static async createStudent(studentData) {
        const { firstName, lastName, dateOfBirth, grade, studentId, rfidTag, nfcTag, schoolId, parentId, photo, medicalInfo, } = studentData;
        // Validate school exists
        const school = await database_1.default.school.findUnique({
            where: { id: schoolId },
        });
        if (!school) {
            throw new errorHandler_1.CustomError("School not found", 404);
        }
        // Validate parent exists if provided
        if (parentId) {
            const parent = await database_1.default.parent.findUnique({
                where: { id: parentId },
            });
            if (!parent) {
                throw new errorHandler_1.CustomError("Parent not found", 404);
            }
        }
        // Check for duplicate student ID in the same school
        const existingStudent = await database_1.default.student.findFirst({
            where: {
                studentId,
                schoolId,
            },
        });
        if (existingStudent) {
            throw new errorHandler_1.CustomError("Student ID already exists in this school", 400);
        }
        // Check for duplicate RFID tag
        if (rfidTag) {
            const existingRFID = await database_1.default.student.findUnique({
                where: { rfidTag },
            });
            if (existingRFID) {
                throw new errorHandler_1.CustomError("RFID tag already assigned to another student", 400);
            }
        }
        // Check for duplicate NFC tag
        if (nfcTag) {
            const existingNFC = await database_1.default.student.findUnique({
                where: { nfcTag },
            });
            if (existingNFC) {
                throw new errorHandler_1.CustomError("NFC tag already assigned to another student", 400);
            }
        }
        const student = await database_1.default.student.create({
            data: {
                firstName,
                lastName,
                dateOfBirth,
                grade,
                studentId,
                rfidTag,
                nfcTag,
                schoolId,
                parentId,
                photo,
                medicalInfo,
            },
            include: {
                school: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                parent: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                },
                assignments: {
                    include: {
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
                                latitude: true,
                                longitude: true,
                            },
                        },
                    },
                },
            },
        });
        return student;
    }
    // Get student by ID
    static async getStudentById(studentId) {
        const student = await database_1.default.student.findUnique({
            where: { id: studentId },
            include: {
                school: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                parent: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                },
                assignments: {
                    where: { isActive: true },
                    include: {
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
                                latitude: true,
                                longitude: true,
                                sequence: true,
                            },
                        },
                    },
                },
                attendance: {
                    take: 10,
                    orderBy: { createdAt: "desc" },
                    include: {
                        trip: {
                            select: {
                                id: true,
                                scheduledStart: true,
                                status: true,
                            },
                        },
                    },
                },
            },
        });
        if (!student) {
            throw new errorHandler_1.CustomError("Student not found", 404);
        }
        return student;
    }
    // Update student
    static async updateStudent(studentId, updateData) {
        const { firstName, lastName, dateOfBirth, grade, studentId: newStudentId, rfidTag, nfcTag, parentId, photo, medicalInfo, isActive, } = updateData;
        // Check if student exists
        const existingStudent = await database_1.default.student.findUnique({
            where: { id: studentId },
        });
        if (!existingStudent) {
            throw new errorHandler_1.CustomError("Student not found", 404);
        }
        // Validate parent exists if provided
        if (parentId) {
            const parent = await database_1.default.parent.findUnique({
                where: { id: parentId },
            });
            if (!parent) {
                throw new errorHandler_1.CustomError("Parent not found", 404);
            }
        }
        // Check for duplicate student ID (excluding current student)
        if (newStudentId && newStudentId !== existingStudent.studentId) {
            const duplicateStudent = await database_1.default.student.findFirst({
                where: {
                    studentId: newStudentId,
                    schoolId: existingStudent.schoolId,
                    id: { not: studentId },
                },
            });
            if (duplicateStudent) {
                throw new errorHandler_1.CustomError("Student ID already exists in this school", 400);
            }
        }
        // Check for duplicate RFID tag (excluding current student)
        if (rfidTag && rfidTag !== existingStudent.rfidTag) {
            const existingRFID = await database_1.default.student.findFirst({
                where: {
                    rfidTag,
                    id: { not: studentId },
                },
            });
            if (existingRFID) {
                throw new errorHandler_1.CustomError("RFID tag already assigned to another student", 400);
            }
        }
        // Check for duplicate NFC tag (excluding current student)
        if (nfcTag && nfcTag !== existingStudent.nfcTag) {
            const existingNFC = await database_1.default.student.findFirst({
                where: {
                    nfcTag,
                    id: { not: studentId },
                },
            });
            if (existingNFC) {
                throw new errorHandler_1.CustomError("NFC tag already assigned to another student", 400);
            }
        }
        const student = await database_1.default.student.update({
            where: { id: studentId },
            data: {
                ...(firstName && { firstName }),
                ...(lastName && { lastName }),
                ...(dateOfBirth && { dateOfBirth }),
                ...(grade && { grade }),
                ...(newStudentId && { studentId: newStudentId }),
                ...(rfidTag !== undefined && { rfidTag }),
                ...(nfcTag !== undefined && { nfcTag }),
                ...(parentId !== undefined && { parentId }),
                ...(photo !== undefined && { photo }),
                ...(medicalInfo !== undefined && { medicalInfo }),
                ...(isActive !== undefined && { isActive }),
            },
            include: {
                school: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                parent: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                },
                assignments: {
                    where: { isActive: true },
                    include: {
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
                                latitude: true,
                                longitude: true,
                            },
                        },
                    },
                },
            },
        });
        return student;
    }
    // Delete student (soft delete by setting isActive to false)
    static async deleteStudent(studentId) {
        const student = await database_1.default.student.findUnique({
            where: { id: studentId },
        });
        if (!student) {
            throw new errorHandler_1.CustomError("Student not found", 404);
        }
        // Soft delete by deactivating
        await database_1.default.student.update({
            where: { id: studentId },
            data: { isActive: false },
        });
        // Deactivate all route assignments
        await database_1.default.studentRouteAssignment.updateMany({
            where: { studentId },
            data: { isActive: false },
        });
    }
    // Get students with filters and pagination
    static async getStudents(filters, page = 1, limit = 20) {
        const { schoolId, grade, isActive = true, parentId, routeId } = filters;
        const skip = (page - 1) * limit;
        const where = {
            isActive,
        };
        if (schoolId) {
            where.schoolId = schoolId;
        }
        if (grade) {
            where.grade = grade;
        }
        if (parentId) {
            where.parentId = parentId;
        }
        if (routeId) {
            where.assignments = {
                some: {
                    routeId,
                    isActive: true,
                },
            };
        }
        const [students, total] = await Promise.all([
            database_1.default.student.findMany({
                where,
                include: {
                    school: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    parent: {
                        include: {
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                },
                            },
                        },
                    },
                    assignments: {
                        where: { isActive: true },
                        include: {
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
                                    latitude: true,
                                    longitude: true,
                                    sequence: true,
                                },
                            },
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
            database_1.default.student.count({ where }),
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            students,
            total,
            page,
            limit,
            totalPages,
        };
    }
    // Assign student to route and stop
    static async assignToRoute(studentId, routeId, stopId) {
        // Validate student exists
        const student = await database_1.default.student.findUnique({
            where: { id: studentId },
        });
        if (!student) {
            throw new errorHandler_1.CustomError("Student not found", 404);
        }
        // Validate route exists and belongs to student's school
        const route = await database_1.default.route.findFirst({
            where: {
                id: routeId,
                schoolId: student.schoolId,
            },
        });
        if (!route) {
            throw new errorHandler_1.CustomError("Route not found or doesn't belong to student's school", 404);
        }
        // Validate stop exists and belongs to the route
        const stop = await database_1.default.routeStop.findFirst({
            where: {
                id: stopId,
                routeId,
            },
        });
        if (!stop) {
            throw new errorHandler_1.CustomError("Stop not found or doesn't belong to the route", 404);
        }
        // Check if assignment already exists
        const existingAssignment = await database_1.default.studentRouteAssignment.findUnique({
            where: {
                studentId_routeId: {
                    studentId,
                    routeId,
                },
            },
        });
        if (existingAssignment) {
            // Update existing assignment
            return await database_1.default.studentRouteAssignment.update({
                where: { id: existingAssignment.id },
                data: {
                    stopId,
                    isActive: true,
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
                            latitude: true,
                            longitude: true,
                        },
                    },
                },
            });
        }
        else {
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
                            latitude: true,
                            longitude: true,
                        },
                    },
                },
            });
        }
    }
    // Unassign student from route
    static async unassignFromRoute(studentId, routeId) {
        const assignment = await database_1.default.studentRouteAssignment.findUnique({
            where: {
                studentId_routeId: {
                    studentId,
                    routeId,
                },
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
    // Record RFID attendance
    static async recordRFIDAttendance(rfidData, recordedBy) {
        const { rfidTag, busId, tripId, timestamp = new Date(), action } = rfidData;
        // Find student by RFID tag
        const student = await database_1.default.student.findUnique({
            where: { rfidTag },
            include: {
                school: true,
                assignments: {
                    where: { isActive: true },
                    include: {
                        route: {
                            include: {
                                bus: true,
                            },
                        },
                    },
                },
            },
        });
        if (!student) {
            throw new errorHandler_1.CustomError("Student not found for this RFID tag", 404);
        }
        // Validate bus is assigned to student's route
        const validAssignment = student.assignments.find((assignment) => assignment.route.busId === busId);
        if (!validAssignment) {
            throw new errorHandler_1.CustomError("Student is not assigned to this bus", 400);
        }
        // Find or create trip
        let trip;
        if (tripId) {
            trip = await database_1.default.trip.findUnique({
                where: { id: tripId },
            });
            if (!trip) {
                throw new errorHandler_1.CustomError("Trip not found", 404);
            }
        }
        else {
            // Find active trip for this bus today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            trip = await database_1.default.trip.findFirst({
                where: {
                    busId,
                    scheduledStart: {
                        gte: today,
                        lt: tomorrow,
                    },
                    status: { in: ["IN_PROGRESS", "SCHEDULED"] },
                },
            });
            if (!trip) {
                // Create a new trip if none exists
                trip = await database_1.default.trip.create({
                    data: {
                        busId,
                        routeId: validAssignment.routeId,
                        driverId: validAssignment.route.bus?.driverId || "",
                        scheduledStart: new Date(),
                        scheduledEnd: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours later
                        status: "IN_PROGRESS",
                    },
                });
            }
        }
        // Check if attendance already exists for this student and trip
        const existingAttendance = await database_1.default.attendance.findUnique({
            where: {
                studentId_tripId: {
                    studentId: student.id,
                    tripId: trip.id,
                },
            },
        });
        let attendance;
        if (existingAttendance) {
            // Update existing attendance
            const updateData = {
                recordedBy,
            };
            if (action === "pickup" && !existingAttendance.pickupTime) {
                updateData.pickupTime = timestamp;
                updateData.status = "PRESENT";
            }
            else if (action === "drop" && !existingAttendance.dropTime) {
                updateData.dropTime = timestamp;
                if (existingAttendance.pickupTime) {
                    updateData.status = "PRESENT";
                }
            }
            attendance = await database_1.default.attendance.update({
                where: { id: existingAttendance.id },
                data: updateData,
                include: {
                    student: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            grade: true,
                        },
                    },
                    trip: {
                        select: {
                            id: true,
                            scheduledStart: true,
                        },
                    },
                },
            });
        }
        else {
            // Create new attendance record
            const attendanceData = {
                studentId: student.id,
                tripId: trip.id,
                recordedBy,
                status: "PRESENT",
            };
            if (action === "pickup") {
                attendanceData.pickupTime = timestamp;
            }
            else if (action === "drop") {
                attendanceData.dropTime = timestamp;
            }
            attendance = await database_1.default.attendance.create({
                data: attendanceData,
                include: {
                    student: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            grade: true,
                        },
                    },
                    trip: {
                        select: {
                            id: true,
                            scheduledStart: true,
                        },
                    },
                },
            });
        }
        return {
            ...attendance,
            action,
            method: "RFID",
            timestamp,
        };
    }
    // Record NFC attendance
    static async recordNFCAttendance(nfcData, recordedBy) {
        const { nfcTag, busId, tripId, timestamp = new Date(), action } = nfcData;
        // Find student by NFC tag
        const student = await database_1.default.student.findUnique({
            where: { nfcTag },
            include: {
                school: true,
                assignments: {
                    where: { isActive: true },
                    include: {
                        route: {
                            include: {
                                bus: true,
                            },
                        },
                    },
                },
            },
        });
        if (!student) {
            throw new errorHandler_1.CustomError("Student not found for this NFC tag", 404);
        }
        // Validate bus is assigned to student's route
        const validAssignment = student.assignments.find((assignment) => assignment.route.busId === busId);
        if (!validAssignment) {
            throw new errorHandler_1.CustomError("Student is not assigned to this bus", 400);
        }
        // Find or create trip
        let trip;
        if (tripId) {
            trip = await database_1.default.trip.findUnique({
                where: { id: tripId },
            });
            if (!trip) {
                throw new errorHandler_1.CustomError("Trip not found", 404);
            }
        }
        else {
            // Find active trip for this bus today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            trip = await database_1.default.trip.findFirst({
                where: {
                    busId,
                    scheduledStart: {
                        gte: today,
                        lt: tomorrow,
                    },
                    status: { in: ["IN_PROGRESS", "SCHEDULED"] },
                },
            });
            if (!trip) {
                // Create a new trip if none exists
                trip = await database_1.default.trip.create({
                    data: {
                        busId,
                        routeId: validAssignment.routeId,
                        driverId: validAssignment.route.bus?.driverId || "",
                        scheduledStart: new Date(),
                        scheduledEnd: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours later
                        status: "IN_PROGRESS",
                    },
                });
            }
        }
        // Check if attendance already exists for this student and trip
        const existingAttendance = await database_1.default.attendance.findUnique({
            where: {
                studentId_tripId: {
                    studentId: student.id,
                    tripId: trip.id,
                },
            },
        });
        let attendance;
        if (existingAttendance) {
            // Update existing attendance
            const updateData = {
                recordedBy,
            };
            if (action === "pickup" && !existingAttendance.pickupTime) {
                updateData.pickupTime = timestamp;
                updateData.status = "PRESENT";
            }
            else if (action === "drop" && !existingAttendance.dropTime) {
                updateData.dropTime = timestamp;
                if (existingAttendance.pickupTime) {
                    updateData.status = "PRESENT";
                }
            }
            attendance = await database_1.default.attendance.update({
                where: { id: existingAttendance.id },
                data: updateData,
                include: {
                    student: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            grade: true,
                        },
                    },
                    trip: {
                        select: {
                            id: true,
                            scheduledStart: true,
                        },
                    },
                },
            });
        }
        else {
            // Create new attendance record
            const attendanceData = {
                studentId: student.id,
                tripId: trip.id,
                recordedBy,
                status: "PRESENT",
            };
            if (action === "pickup") {
                attendanceData.pickupTime = timestamp;
            }
            else if (action === "drop") {
                attendanceData.dropTime = timestamp;
            }
            attendance = await database_1.default.attendance.create({
                data: attendanceData,
                include: {
                    student: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            grade: true,
                        },
                    },
                    trip: {
                        select: {
                            id: true,
                            scheduledStart: true,
                        },
                    },
                },
            });
        }
        return {
            ...attendance,
            action,
            method: "NFC",
            timestamp,
        };
    }
    // Get student attendance history
    static async getStudentAttendance(studentId, startDate, endDate, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const where = {
            studentId,
        };
        if (startDate || endDate) {
            where.trip = {
                date: {},
            };
            if (startDate)
                where.trip.date.gte = startDate;
            if (endDate)
                where.trip.date.lte = endDate;
        }
        const [attendance, total] = await Promise.all([
            database_1.default.attendance.findMany({
                where,
                include: {
                    trip: {
                        select: {
                            id: true,
                            scheduledStart: true,
                            status: true,
                            bus: {
                                select: {
                                    id: true,
                                    plateNumber: true,
                                    model: true,
                                },
                            },
                            route: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            database_1.default.attendance.count({ where }),
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            attendance,
            total,
            page,
            limit,
            totalPages,
        };
    }
    // Get attendance statistics for a school
    static async getAttendanceStats(schoolId, startDate, endDate) {
        // Get all active students in the school
        const totalStudents = await database_1.default.student.count({
            where: {
                schoolId,
                isActive: true,
            },
        });
        // Get today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        // Get attendance for today
        const todayAttendance = await database_1.default.attendance.findMany({
            where: {
                student: {
                    schoolId,
                    isActive: true,
                },
                trip: {
                    scheduledStart: {
                        gte: today,
                        lt: tomorrow,
                    },
                },
            },
            select: {
                status: true,
            },
        });
        const presentToday = todayAttendance.filter((a) => a.status === "PRESENT").length;
        const absentToday = todayAttendance.filter((a) => a.status === "ABSENT").length;
        const notRecordedToday = totalStudents - presentToday - absentToday;
        const attendanceRate = totalStudents > 0 ? (presentToday / totalStudents) * 100 : 0;
        return {
            totalStudents,
            presentToday,
            absentToday,
            notRecordedToday,
            attendanceRate: Math.round(attendanceRate * 100) / 100,
        };
    }
    // Get students without RFID/NFC tags
    static async getStudentsWithoutTags(schoolId) {
        const where = {
            isActive: true,
            OR: [{ rfidTag: null }, { nfcTag: null }],
        };
        if (schoolId) {
            where.schoolId = schoolId;
        }
        return await database_1.default.student.findMany({
            where,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                grade: true,
                studentId: true,
                rfidTag: true,
                nfcTag: true,
                school: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    }
    // Bulk assign RFID/NFC tags to students
    static async bulkAssignTags(assignments) {
        const results = [];
        for (const assignment of assignments) {
            try {
                const student = await this.updateStudent(assignment.studentId, {
                    rfidTag: assignment.rfidTag,
                    nfcTag: assignment.nfcTag,
                });
                results.push({
                    success: true,
                    studentId: assignment.studentId,
                    data: student,
                });
            }
            catch (error) {
                results.push({
                    success: false,
                    studentId: assignment.studentId,
                    error: error.message,
                });
            }
        }
        return results;
    }
    // Get student manifest for a bus/trip
    static async getStudentManifest(busId, tripId) {
        let trip;
        if (tripId) {
            trip = await database_1.default.trip.findUnique({
                where: { id: tripId },
                include: {
                    route: {
                        include: {
                            assignments: {
                                where: { isActive: true },
                                include: {
                                    student: {
                                        include: {
                                            attendance: {
                                                where: { tripId },
                                            },
                                        },
                                    },
                                    stop: {
                                        select: {
                                            id: true,
                                            name: true,
                                            sequence: true,
                                        },
                                    },
                                },
                                orderBy: {
                                    stop: {
                                        sequence: "asc",
                                    },
                                },
                            },
                        },
                    },
                },
            });
            if (!trip) {
                throw new errorHandler_1.CustomError("Trip not found", 404);
            }
        }
        else {
            // Find active trip for today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            trip = await database_1.default.trip.findFirst({
                where: {
                    busId,
                    scheduledStart: {
                        gte: today,
                        lt: tomorrow,
                    },
                },
                include: {
                    route: {
                        include: {
                            assignments: {
                                where: { isActive: true },
                                include: {
                                    student: true,
                                    stop: {
                                        select: {
                                            id: true,
                                            name: true,
                                            sequence: true,
                                        },
                                    },
                                },
                                orderBy: {
                                    stop: {
                                        sequence: "asc",
                                    },
                                },
                            },
                        },
                    },
                },
            });
            if (!trip) {
                throw new errorHandler_1.CustomError("No active trip found for this bus today", 404);
            }
        }
        // Format the manifest
        const manifest = trip.route.assignments.map((assignment) => ({
            student: {
                id: assignment.student.id,
                firstName: assignment.student.firstName,
                lastName: assignment.student.lastName,
                grade: assignment.student.grade,
                studentId: assignment.student.studentId,
                rfidTag: assignment.student.rfidTag,
                nfcTag: assignment.student.nfcTag,
                photo: assignment.student.photo,
                medicalInfo: assignment.student.medicalInfo,
            },
            stop: assignment.stop,
            attendance: tripId ? assignment.student.attendance[0] || null : null,
        }));
        return manifest;
    }
}
exports.StudentService = StudentService;
//# sourceMappingURL=studentService.js.map