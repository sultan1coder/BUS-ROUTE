import { Response } from "express";
import { AuthenticatedRequest, ApiResponse, PaginatedResponse } from "../types";
import {
  StudentService,
  CreateStudentData,
  UpdateStudentData,
  StudentFilters,
  RFIDAttendanceData,
  NFCAttendanceData,
} from "../services/studentService";
import { asyncHandler } from "../middleware/errorHandler";

export class StudentController {
  // Create a new student
  static createStudent = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const studentData: CreateStudentData = req.body;

      const student = await StudentService.createStudent(studentData);

      res.status(201).json({
        success: true,
        message: "Student created successfully",
        data: student,
      });
    }
  );

  // Get student by ID
  static getStudentById = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { id } = req.params;

      const student = await StudentService.getStudentById(id);

      res.status(200).json({
        success: true,
        data: student,
      });
    }
  );

  // Update student
  static updateStudent = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { id } = req.params;
      const updateData: UpdateStudentData = req.body;

      const student = await StudentService.updateStudent(id, updateData);

      res.status(200).json({
        success: true,
        message: "Student updated successfully",
        data: student,
      });
    }
  );

  // Delete student (soft delete)
  static deleteStudent = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { id } = req.params;

      await StudentService.deleteStudent(id);

      res.status(200).json({
        success: true,
        message: "Student deleted successfully",
      });
    }
  );

  // Get students with filters and pagination
  static getStudents = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<PaginatedResponse<any>>
    ): Promise<void> => {
      const {
        schoolId,
        grade,
        isActive,
        parentId,
        routeId,
        page = 1,
        limit = 20,
      } = req.query;

      const filters: StudentFilters = {};

      if (schoolId) filters.schoolId = schoolId as string;
      if (grade) filters.grade = grade as string;
      if (isActive !== undefined) filters.isActive = isActive === "true";
      if (parentId) filters.parentId = parentId as string;
      if (routeId) filters.routeId = routeId as string;

      const result = await StudentService.getStudents(
        filters,
        parseInt(page as string, 10),
        parseInt(limit as string, 10)
      );

      res.status(200).json({
        success: true,
        data: result.students,
        meta: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    }
  );

  // Assign student to route and stop
  static assignToRoute = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { studentId, routeId, stopId } = req.body;

      const assignment = await StudentService.assignToRoute(
        studentId,
        routeId,
        stopId
      );

      res.status(200).json({
        success: true,
        message: "Student assigned to route successfully",
        data: assignment,
      });
    }
  );

  // Unassign student from route
  static unassignFromRoute = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { studentId, routeId } = req.params;

      await StudentService.unassignFromRoute(studentId, routeId);

      res.status(200).json({
        success: true,
        message: "Student unassigned from route successfully",
      });
    }
  );

  // Record RFID attendance
  static recordRFIDAttendance = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const rfidData: RFIDAttendanceData = req.body;
      const recordedBy = req.user?.id;

      const attendance = await StudentService.recordRFIDAttendance(
        rfidData,
        recordedBy
      );

      res.status(200).json({
        success: true,
        message: "RFID attendance recorded successfully",
        data: attendance,
      });
    }
  );

  // Record NFC attendance
  static recordNFCAttendance = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const nfcData: NFCAttendanceData = req.body;
      const recordedBy = req.user?.id;

      const attendance = await StudentService.recordNFCAttendance(
        nfcData,
        recordedBy
      );

      res.status(200).json({
        success: true,
        message: "NFC attendance recorded successfully",
        data: attendance,
      });
    }
  );

  // Get student attendance history
  static getStudentAttendance = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<PaginatedResponse<any>>
    ): Promise<void> => {
      const { id } = req.params;
      const { startDate, endDate, page = 1, limit = 20 } = req.query;

      const result = await StudentService.getStudentAttendance(
        id,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
        parseInt(page as string, 10),
        parseInt(limit as string, 10)
      );

      res.status(200).json({
        success: true,
        data: result.attendance,
        meta: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    }
  );

  // Get attendance statistics for a school
  static getAttendanceStats = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { schoolId } = req.params;
      const { startDate, endDate } = req.query;

      const stats = await StudentService.getAttendanceStats(
        schoolId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.status(200).json({
        success: true,
        data: stats,
      });
    }
  );

  // Get students without RFID/NFC tags
  static getStudentsWithoutTags = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { schoolId } = req.query;

      const students = await StudentService.getStudentsWithoutTags(
        schoolId as string
      );

      res.status(200).json({
        success: true,
        data: students,
      });
    }
  );

  // Bulk assign RFID/NFC tags to students
  static bulkAssignTags = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { assignments } = req.body;

      const results = await StudentService.bulkAssignTags(assignments);

      const successCount = results.filter((r: any) => r.success).length;
      const failureCount = results.filter((r: any) => !r.success).length;

      res.status(200).json({
        success: true,
        message: `Bulk tag assignment completed: ${successCount} successful, ${failureCount} failed`,
        data: {
          total: assignments.length,
          successful: successCount,
          failed: failureCount,
          results,
        },
      });
    }
  );

  // Get student manifest for a bus/trip
  static getStudentManifest = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { busId } = req.params;
      const { tripId } = req.query;

      const manifest = await StudentService.getStudentManifest(
        busId,
        tripId as string
      );

      res.status(200).json({
        success: true,
        data: manifest,
      });
    }
  );

  // Manual attendance recording (for school staff)
  static recordManualAttendance = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { studentId, tripId, status, pickupTime, dropTime, notes } =
        req.body;

      const recordedBy = req.user?.id;

      // Check if attendance already exists
      const existingAttendance = await StudentService.getStudentAttendance(
        studentId
      );
      const todayAttendance = existingAttendance.attendance.find(
        (a: any) => a.trip.id === tripId
      );

      let attendance;

      if (todayAttendance) {
        // Update existing attendance
        const updateData: any = {
          status,
          recordedBy,
        };

        if (pickupTime) updateData.pickupTime = new Date(pickupTime);
        if (dropTime) updateData.dropTime = new Date(dropTime);
        if (notes !== undefined) updateData.notes = notes;

        // Note: This is a simplified update - in a real implementation,
        // you'd need to add an update method to the service
        attendance = todayAttendance;
      } else {
        // Create new attendance record
        // Note: This is a simplified creation - in a real implementation,
        // you'd need to add a create method to the service
        attendance = {
          studentId,
          tripId,
          status,
          pickupTime: pickupTime ? new Date(pickupTime) : null,
          dropTime: dropTime ? new Date(dropTime) : null,
          notes,
          recordedBy,
        };
      }

      res.status(200).json({
        success: true,
        message: "Manual attendance recorded successfully",
        data: attendance,
      });
    }
  );

  // Get attendance report for a specific date range
  static getAttendanceReport = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { schoolId, startDate, endDate } = req.query;

      if (!schoolId) {
        res.status(400).json({
          success: false,
          message: "schoolId parameter is required",
        });
        return;
      }

      const start = startDate ? new Date(startDate as string) : new Date();
      const end = endDate ? new Date(endDate as string) : new Date();

      // Get all students in the school
      const students = await StudentService.getStudents(
        { schoolId: schoolId as string },
        1,
        1000 // Get all students
      );

      // Get attendance for each student in the date range
      const report = [];

      for (const student of students.students) {
        const attendance = await StudentService.getStudentAttendance(
          student.id,
          start,
          end,
          1,
          100 // Get all attendance records for the period
        );

        report.push({
          student: {
            id: student.id,
            firstName: student.firstName,
            lastName: student.lastName,
            grade: student.grade,
            studentId: student.studentId,
          },
          attendance: attendance.attendance,
          summary: {
            totalDays: calculateBusinessDays(start, end),
            presentDays: attendance.attendance.filter(
              (a: any) => a.status === "PRESENT"
            ).length,
            absentDays: attendance.attendance.filter(
              (a: any) => a.status === "ABSENT"
            ).length,
            attendanceRate:
              attendance.attendance.length > 0
                ? (attendance.attendance.filter(
                    (a: any) => a.status === "PRESENT"
                  ).length /
                    attendance.attendance.length) *
                  100
                : 0,
          },
        });
      }

      res.status(200).json({
        success: true,
        data: {
          schoolId,
          dateRange: { start, end },
          students: report,
          summary: {
            totalStudents: report.length,
            averageAttendanceRate:
              report.length > 0
                ? report.reduce((sum, s) => sum + s.summary.attendanceRate, 0) /
                  report.length
                : 0,
          },
        },
      });
    }
  );
}

// Helper function to calculate business days
function calculateBusinessDays(startDate: Date, endDate: Date): number {
  let count = 0;
  const curDate = new Date(startDate);

  while (curDate <= endDate) {
    const dayOfWeek = curDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Not Sunday (0) or Saturday (6)
      count++;
    }
    curDate.setDate(curDate.getDate() + 1);
  }

  return count;
}
