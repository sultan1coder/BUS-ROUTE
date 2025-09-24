import { Router } from "express";
import { StudentController } from "../controllers/studentController";
import {
  authenticate,
  requireSchoolStaff,
  requireDriver,
  authorizeSchoolAccess,
} from "../middleware/auth";
import {
  validateStudentData,
  validateStudentCreation,
  validateUUID,
  validatePagination,
  validateAttendanceData,
  handleValidationErrors,
} from "../middleware/validation";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Student CRUD operations
router.post(
  "/",
  requireSchoolStaff,
  validateStudentCreation,
  handleValidationErrors,
  StudentController.createStudent
);

router.get(
  "/",
  validatePagination,
  handleValidationErrors,
  StudentController.getStudents
);

// Attendance routes must come before /:id route to avoid conflicts
router.get(
  "/attendance",
  requireSchoolStaff,
  handleValidationErrors,
  StudentController.getAttendanceByDate
);

router.get(
  "/attendance/stats",
  requireSchoolStaff,
  handleValidationErrors,
  StudentController.getGeneralAttendanceStats
);

router.get(
  "/attendance/stats/:schoolId",
  requireSchoolStaff,
  validateUUID,
  handleValidationErrors,
  StudentController.getAttendanceStatsBySchool
);

router.get(
  "/attendance/report",
  requireSchoolStaff,
  handleValidationErrors,
  StudentController.getAttendanceReport
);

router.get(
  "/:id",
  validateUUID,
  handleValidationErrors,
  StudentController.getStudentById
);

router.put(
  "/:id",
  requireSchoolStaff,
  validateUUID,
  handleValidationErrors,
  StudentController.updateStudent
);

router.delete(
  "/:id",
  requireSchoolStaff,
  validateUUID,
  handleValidationErrors,
  StudentController.deleteStudent
);

// Route assignments
router.post(
  "/assign-route",
  requireSchoolStaff,
  handleValidationErrors,
  StudentController.assignToRoute
);

router.delete(
  "/:studentId/routes/:routeId",
  requireSchoolStaff,
  validateUUID,
  handleValidationErrors,
  StudentController.unassignFromRoute
);

// RFID/NFC attendance recording
router.post(
  "/attendance/rfid",
  validateAttendanceData,
  handleValidationErrors,
  StudentController.recordRFIDAttendance
);

router.post(
  "/attendance/nfc",
  validateAttendanceData,
  handleValidationErrors,
  StudentController.recordNFCAttendance
);

// Manual attendance recording (school staff only)
router.post(
  "/attendance/manual",
  requireSchoolStaff,
  handleValidationErrors,
  StudentController.recordManualAttendance
);

// Attendance routes moved above to avoid conflicts with /:id route

// Parameterized routes after specific routes
router.get(
  "/:id/attendance",
  validateUUID,
  validatePagination,
  handleValidationErrors,
  StudentController.getStudentAttendance
);

// Tag management
router.get(
  "/without-tags",
  requireSchoolStaff,
  handleValidationErrors,
  StudentController.getStudentsWithoutTags
);

router.post(
  "/bulk-assign-tags",
  requireSchoolStaff,
  handleValidationErrors,
  StudentController.bulkAssignTags
);

// Driver routes
router.get(
  "/manifest/bus/:busId",
  requireDriver,
  validateUUID,
  handleValidationErrors,
  StudentController.getStudentManifest
);

export default router;
