import prisma from "../config/database";
import { CustomError } from "../middleware/errorHandler";

export interface CreateStudentData {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  grade: string;
  studentId: string;
  rfidTag?: string;
  nfcTag?: string;
  schoolId: string;
  parentId?: string;
  photo?: string;
  medicalInfo?: string;
}

export interface UpdateStudentData {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  grade?: string;
  studentId?: string;
  rfidTag?: string;
  nfcTag?: string;
  parentId?: string;
  photo?: string;
  medicalInfo?: string;
  isActive?: boolean;
}

export interface StudentFilters {
  schoolId?: string;
  grade?: string;
  isActive?: boolean;
  parentId?: string;
  routeId?: string;
}

export interface RFIDAttendanceData {
  rfidTag: string;
  busId: string;
  tripId?: string;
  timestamp?: Date;
  action: "pickup" | "drop";
}

export interface NFCAttendanceData {
  nfcTag: string;
  busId: string;
  tripId?: string;
  timestamp?: Date;
  action: "pickup" | "drop";
}

export class StudentService {
  // Create a new student
  static async createStudent(studentData: CreateStudentData): Promise<any> {
    const {
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
    } = studentData;

    // Validate school exists
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
    });

    if (!school) {
      throw new CustomError("School not found", 404);
    }

    // Validate parent exists if provided
    if (parentId) {
      const parent = await prisma.parent.findUnique({
        where: { id: parentId },
      });

      if (!parent) {
        throw new CustomError("Parent not found", 404);
      }
    }

    // Check for duplicate student ID in the same school
    const existingStudent = await prisma.student.findFirst({
      where: {
        studentId,
        schoolId,
      },
    });

    if (existingStudent) {
      throw new CustomError("Student ID already exists in this school", 400);
    }

    // Check for duplicate RFID tag
    if (rfidTag) {
      const existingRFID = await prisma.student.findUnique({
        where: { rfidTag },
      });

      if (existingRFID) {
        throw new CustomError(
          "RFID tag already assigned to another student",
          400
        );
      }
    }

    // Check for duplicate NFC tag
    if (nfcTag) {
      const existingNFC = await prisma.student.findUnique({
        where: { nfcTag },
      });

      if (existingNFC) {
        throw new CustomError(
          "NFC tag already assigned to another student",
          400
        );
      }
    }

    const student = await prisma.student.create({
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
  static async getStudentById(studentId: string): Promise<any> {
    const student = await prisma.student.findUnique({
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
      throw new CustomError("Student not found", 404);
    }

    return student;
  }

  // Update student
  static async updateStudent(
    studentId: string,
    updateData: UpdateStudentData
  ): Promise<any> {
    const {
      firstName,
      lastName,
      dateOfBirth,
      grade,
      studentId: newStudentId,
      rfidTag,
      nfcTag,
      parentId,
      photo,
      medicalInfo,
      isActive,
    } = updateData;

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!existingStudent) {
      throw new CustomError("Student not found", 404);
    }

    // Validate parent exists if provided
    if (parentId) {
      const parent = await prisma.parent.findUnique({
        where: { id: parentId },
      });

      if (!parent) {
        throw new CustomError("Parent not found", 404);
      }
    }

    // Check for duplicate student ID (excluding current student)
    if (newStudentId && newStudentId !== existingStudent.studentId) {
      const duplicateStudent = await prisma.student.findFirst({
        where: {
          studentId: newStudentId,
          schoolId: existingStudent.schoolId,
          id: { not: studentId },
        },
      });

      if (duplicateStudent) {
        throw new CustomError("Student ID already exists in this school", 400);
      }
    }

    // Check for duplicate RFID tag (excluding current student)
    if (rfidTag && rfidTag !== existingStudent.rfidTag) {
      const existingRFID = await prisma.student.findFirst({
        where: {
          rfidTag,
          id: { not: studentId },
        },
      });

      if (existingRFID) {
        throw new CustomError(
          "RFID tag already assigned to another student",
          400
        );
      }
    }

    // Check for duplicate NFC tag (excluding current student)
    if (nfcTag && nfcTag !== existingStudent.nfcTag) {
      const existingNFC = await prisma.student.findFirst({
        where: {
          nfcTag,
          id: { not: studentId },
        },
      });

      if (existingNFC) {
        throw new CustomError(
          "NFC tag already assigned to another student",
          400
        );
      }
    }

    const student = await prisma.student.update({
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
  static async deleteStudent(studentId: string): Promise<void> {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new CustomError("Student not found", 404);
    }

    // Soft delete by deactivating
    await prisma.student.update({
      where: { id: studentId },
      data: { isActive: false },
    });

    // Deactivate all route assignments
    await prisma.studentRouteAssignment.updateMany({
      where: { studentId },
      data: { isActive: false },
    });
  }

  // Get students with filters and pagination
  static async getStudents(
    filters: StudentFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    students: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { schoolId, grade, isActive = true, parentId, routeId } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
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
      prisma.student.findMany({
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
      prisma.student.count({ where }),
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
  static async assignToRoute(
    studentId: string,
    routeId: string,
    stopId: string
  ): Promise<any> {
    // Validate student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new CustomError("Student not found", 404);
    }

    // Validate route exists and belongs to student's school
    const route = await prisma.route.findFirst({
      where: {
        id: routeId,
        schoolId: student.schoolId,
      },
    });

    if (!route) {
      throw new CustomError(
        "Route not found or doesn't belong to student's school",
        404
      );
    }

    // Validate stop exists and belongs to the route
    const stop = await prisma.routeStop.findFirst({
      where: {
        id: stopId,
        routeId,
      },
    });

    if (!stop) {
      throw new CustomError(
        "Stop not found or doesn't belong to the route",
        404
      );
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.studentRouteAssignment.findUnique({
      where: {
        studentId_routeId: {
          studentId,
          routeId,
        },
      },
    });

    if (existingAssignment) {
      // Update existing assignment
      return await prisma.studentRouteAssignment.update({
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
    } else {
      // Create new assignment
      return await prisma.studentRouteAssignment.create({
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
  static async unassignFromRoute(
    studentId: string,
    routeId: string
  ): Promise<void> {
    const assignment = await prisma.studentRouteAssignment.findUnique({
      where: {
        studentId_routeId: {
          studentId,
          routeId,
        },
      },
    });

    if (!assignment) {
      throw new CustomError("Student is not assigned to this route", 404);
    }

    await prisma.studentRouteAssignment.update({
      where: { id: assignment.id },
      data: { isActive: false },
    });
  }

  // Record RFID attendance
  static async recordRFIDAttendance(
    rfidData: RFIDAttendanceData,
    recordedBy?: string
  ): Promise<any> {
    const { rfidTag, busId, tripId, timestamp = new Date(), action } = rfidData;

    // Find student by RFID tag
    const student = await prisma.student.findUnique({
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
      throw new CustomError("Student not found for this RFID tag", 404);
    }

    // Validate bus is assigned to student's route
    const validAssignment = student.assignments.find(
      (assignment) => assignment.route.busId === busId
    );

    if (!validAssignment) {
      throw new CustomError("Student is not assigned to this bus", 400);
    }

    // Find or create trip
    let trip;
    if (tripId) {
      trip = await prisma.trip.findUnique({
        where: { id: tripId },
      });

      if (!trip) {
        throw new CustomError("Trip not found", 404);
      }
    } else {
      // Find active trip for this bus today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      trip = await prisma.trip.findFirst({
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
        trip = await prisma.trip.create({
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
    const existingAttendance = await prisma.attendance.findUnique({
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
      const updateData: any = {
        recordedBy,
      };

      if (action === "pickup" && !existingAttendance.pickupTime) {
        updateData.pickupTime = timestamp;
        updateData.status = "PRESENT";
      } else if (action === "drop" && !existingAttendance.dropTime) {
        updateData.dropTime = timestamp;
        if (existingAttendance.pickupTime) {
          updateData.status = "PRESENT";
        }
      }

      attendance = await prisma.attendance.update({
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
    } else {
      // Create new attendance record
      const attendanceData: any = {
        studentId: student.id,
        tripId: trip.id,
        recordedBy,
        status: "PRESENT",
      };

      if (action === "pickup") {
        attendanceData.pickupTime = timestamp;
      } else if (action === "drop") {
        attendanceData.dropTime = timestamp;
      }

      attendance = await prisma.attendance.create({
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
  static async recordNFCAttendance(
    nfcData: NFCAttendanceData,
    recordedBy?: string
  ): Promise<any> {
    const { nfcTag, busId, tripId, timestamp = new Date(), action } = nfcData;

    // Find student by NFC tag
    const student = await prisma.student.findUnique({
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
      throw new CustomError("Student not found for this NFC tag", 404);
    }

    // Validate bus is assigned to student's route
    const validAssignment = student.assignments.find(
      (assignment) => assignment.route.busId === busId
    );

    if (!validAssignment) {
      throw new CustomError("Student is not assigned to this bus", 400);
    }

    // Find or create trip
    let trip;
    if (tripId) {
      trip = await prisma.trip.findUnique({
        where: { id: tripId },
      });

      if (!trip) {
        throw new CustomError("Trip not found", 404);
      }
    } else {
      // Find active trip for this bus today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      trip = await prisma.trip.findFirst({
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
        trip = await prisma.trip.create({
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
    const existingAttendance = await prisma.attendance.findUnique({
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
      const updateData: any = {
        recordedBy,
      };

      if (action === "pickup" && !existingAttendance.pickupTime) {
        updateData.pickupTime = timestamp;
        updateData.status = "PRESENT";
      } else if (action === "drop" && !existingAttendance.dropTime) {
        updateData.dropTime = timestamp;
        if (existingAttendance.pickupTime) {
          updateData.status = "PRESENT";
        }
      }

      attendance = await prisma.attendance.update({
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
    } else {
      // Create new attendance record
      const attendanceData: any = {
        studentId: student.id,
        tripId: trip.id,
        recordedBy,
        status: "PRESENT",
      };

      if (action === "pickup") {
        attendanceData.pickupTime = timestamp;
      } else if (action === "drop") {
        attendanceData.dropTime = timestamp;
      }

      attendance = await prisma.attendance.create({
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
  static async getStudentAttendance(
    studentId: string,
    startDate?: Date,
    endDate?: Date,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    attendance: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const where: any = {
      studentId,
    };

    if (startDate || endDate) {
      where.trip = {
        date: {},
      };

      if (startDate) where.trip.date.gte = startDate;
      if (endDate) where.trip.date.lte = endDate;
    }

    const [attendance, total] = await Promise.all([
      prisma.attendance.findMany({
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
      prisma.attendance.count({ where }),
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
  static async getAttendanceStats(
    schoolId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalStudents: number;
    presentToday: number;
    absentToday: number;
    notRecordedToday: number;
    attendanceRate: number;
  }> {
    // Get all active students in the school
    const totalStudents = await prisma.student.count({
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
    const todayAttendance = await prisma.attendance.findMany({
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

    const presentToday = todayAttendance.filter(
      (a) => a.status === "PRESENT"
    ).length;
    const absentToday = todayAttendance.filter(
      (a) => a.status === "ABSENT"
    ).length;
    const notRecordedToday = totalStudents - presentToday - absentToday;

    const attendanceRate =
      totalStudents > 0 ? (presentToday / totalStudents) * 100 : 0;

    return {
      totalStudents,
      presentToday,
      absentToday,
      notRecordedToday,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
    };
  }

  // Get students without RFID/NFC tags
  static async getStudentsWithoutTags(schoolId?: string): Promise<any[]> {
    const where: any = {
      isActive: true,
      OR: [{ rfidTag: null }, { nfcTag: null }],
    };

    if (schoolId) {
      where.schoolId = schoolId;
    }

    return await prisma.student.findMany({
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
  static async bulkAssignTags(
    assignments: { studentId: string; rfidTag?: string; nfcTag?: string }[]
  ): Promise<any[]> {
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
      } catch (error: any) {
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
  static async getStudentManifest(
    busId: string,
    tripId?: string
  ): Promise<any[]> {
    let trip;

    if (tripId) {
      trip = await prisma.trip.findUnique({
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
        throw new CustomError("Trip not found", 404);
      }
    } else {
      // Find active trip for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      trip = await prisma.trip.findFirst({
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
        throw new CustomError("No active trip found for this bus today", 404);
      }
    }

    // Format the manifest
    const manifest = trip.route.assignments.map((assignment: any) => ({
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
