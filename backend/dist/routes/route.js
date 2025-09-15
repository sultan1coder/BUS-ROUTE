"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const routeController_1 = require("../controllers/routeController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
// Create route (school staff and admin only)
router.post("/", auth_1.requireSchoolStaff, validation_1.validateRouteCreation, validation_1.handleValidationErrors, routeController_1.RouteController.createRoute);
// Get all routes with filtering and pagination
router.get("/", validation_1.validatePagination, validation_1.handleValidationErrors, routeController_1.RouteController.getRoutes);
// Get route by ID
router.get("/:id", validation_1.validateUUID, validation_1.handleValidationErrors, routeController_1.RouteController.getRouteById);
// Update route (school staff and admin only)
router.put("/:id", auth_1.requireSchoolStaff, validation_1.validateUUID, validation_1.validateRouteUpdate, validation_1.handleValidationErrors, routeController_1.RouteController.updateRoute);
// Delete route (school staff and admin only)
router.delete("/:id", auth_1.requireSchoolStaff, validation_1.validateUUID, validation_1.handleValidationErrors, routeController_1.RouteController.deleteRoute);
// Get route statistics
router.get("/:id/stats", validation_1.validateUUID, validation_1.handleValidationErrors, routeController_1.RouteController.getRouteStats);
// Get routes by school
router.get("/school/:schoolId", validation_1.validateSchoolId, auth_1.authorizeSchoolAccess, validation_1.handleValidationErrors, routeController_1.RouteController.getRoutesBySchool);
// Route stops management
// Create route stop (school staff and admin only)
router.post("/:id/stops", auth_1.requireSchoolStaff, validation_1.validateUUID, validation_1.validateRouteStopCreation, validation_1.handleValidationErrors, routeController_1.RouteController.createRouteStop);
// Update route stop (school staff and admin only)
router.put("/stops/:stopId", auth_1.requireSchoolStaff, validation_1.validateUUID, validation_1.validateRouteStopUpdate, validation_1.handleValidationErrors, routeController_1.RouteController.updateRouteStop);
// Delete route stop (school staff and admin only)
router.delete("/stops/:stopId", auth_1.requireSchoolStaff, validation_1.validateUUID, validation_1.handleValidationErrors, routeController_1.RouteController.deleteRouteStop);
// Get route stops
router.get("/:id/stops", validation_1.validateUUID, validation_1.handleValidationErrors, routeController_1.RouteController.getRouteStops);
// Reorder route stops (school staff and admin only)
router.put("/:id/reorder-stops", auth_1.requireSchoolStaff, validation_1.validateUUID, validation_1.handleValidationErrors, routeController_1.RouteController.reorderRouteStops);
// Student route assignments
// Assign student to route (school staff and admin only)
router.post("/assign-student", auth_1.requireSchoolStaff, validation_1.handleValidationErrors, routeController_1.RouteController.assignStudentToRoute);
// Unassign student from route (school staff and admin only)
router.delete("/unassign-student/:studentId/:routeId", auth_1.requireSchoolStaff, validation_1.validateUUID, validation_1.handleValidationErrors, routeController_1.RouteController.unassignStudentFromRoute);
// Get student's route assignments
router.get("/student/:studentId/assignments", validation_1.validateUUID, validation_1.handleValidationErrors, routeController_1.RouteController.getStudentAssignments);
// Get route assignments
router.get("/:id/assignments", validation_1.validateUUID, validation_1.handleValidationErrors, routeController_1.RouteController.getRouteAssignments);
exports.default = router;
//# sourceMappingURL=route.js.map