"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const studentController_1 = require("../controllers/studentController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
// Student CRUD operations
router.post("/", auth_1.requireSchoolStaff, validation_1.validateStudentData, validation_1.handleValidationErrors, studentController_1.StudentController.createStudent);
router.get("/", validation_1.validatePagination, validation_1.handleValidationErrors, studentController_1.StudentController.getStudents);
// Attendance routes must come before /:id route to avoid conflicts
router.get("/attendance", auth_1.requireSchoolStaff, validation_1.handleValidationErrors, studentController_1.StudentController.getAttendanceByDate);
router.get("/attendance/stats", auth_1.requireSchoolStaff, validation_1.handleValidationErrors, studentController_1.StudentController.getGeneralAttendanceStats);
router.get("/attendance/stats/:schoolId", auth_1.requireSchoolStaff, validation_1.validateUUID, validation_1.handleValidationErrors, studentController_1.StudentController.getAttendanceStatsBySchool);
router.get("/attendance/report", auth_1.requireSchoolStaff, validation_1.handleValidationErrors, studentController_1.StudentController.getAttendanceReport);
router.get("/:id", validation_1.validateUUID, validation_1.handleValidationErrors, studentController_1.StudentController.getStudentById);
router.put("/:id", auth_1.requireSchoolStaff, validation_1.validateUUID, validation_1.handleValidationErrors, studentController_1.StudentController.updateStudent);
router.delete("/:id", auth_1.requireSchoolStaff, validation_1.validateUUID, validation_1.handleValidationErrors, studentController_1.StudentController.deleteStudent);
// Route assignments
router.post("/assign-route", auth_1.requireSchoolStaff, validation_1.handleValidationErrors, studentController_1.StudentController.assignToRoute);
router.delete("/:studentId/routes/:routeId", auth_1.requireSchoolStaff, validation_1.validateUUID, validation_1.handleValidationErrors, studentController_1.StudentController.unassignFromRoute);
// RFID/NFC attendance recording
router.post("/attendance/rfid", validation_1.validateAttendanceData, validation_1.handleValidationErrors, studentController_1.StudentController.recordRFIDAttendance);
router.post("/attendance/nfc", validation_1.validateAttendanceData, validation_1.handleValidationErrors, studentController_1.StudentController.recordNFCAttendance);
// Manual attendance recording (school staff only)
router.post("/attendance/manual", auth_1.requireSchoolStaff, validation_1.handleValidationErrors, studentController_1.StudentController.recordManualAttendance);
// Attendance routes moved above to avoid conflicts with /:id route
// Parameterized routes after specific routes
router.get("/:id/attendance", validation_1.validateUUID, validation_1.validatePagination, validation_1.handleValidationErrors, studentController_1.StudentController.getStudentAttendance);
// Tag management
router.get("/without-tags", auth_1.requireSchoolStaff, validation_1.handleValidationErrors, studentController_1.StudentController.getStudentsWithoutTags);
router.post("/bulk-assign-tags", auth_1.requireSchoolStaff, validation_1.handleValidationErrors, studentController_1.StudentController.bulkAssignTags);
// Driver routes
router.get("/manifest/bus/:busId", auth_1.requireDriver, validation_1.validateUUID, validation_1.handleValidationErrors, studentController_1.StudentController.getStudentManifest);
exports.default = router;
//# sourceMappingURL=student.js.map