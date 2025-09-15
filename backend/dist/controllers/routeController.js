"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteController = void 0;
const routeService_1 = require("../services/routeService");
const errorHandler_1 = require("../middleware/errorHandler");
class RouteController {
}
exports.RouteController = RouteController;
_a = RouteController;
// Create a new route
RouteController.createRoute = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const routeData = req.body;
    const route = await routeService_1.RouteService.createRoute(routeData);
    res.status(201).json({
        success: true,
        message: "Route created successfully",
        data: route,
    });
});
// Get route by ID
RouteController.getRouteById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const route = await routeService_1.RouteService.getRouteById(id);
    res.status(200).json({
        success: true,
        data: route,
    });
});
// Get all routes with filtering and pagination
RouteController.getRoutes = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { schoolId, isActive, hasBus, search, page = 1, limit = 10, } = req.query;
    const filters = {};
    if (schoolId)
        filters.schoolId = schoolId;
    if (isActive !== undefined)
        filters.isActive = isActive === "true";
    if (hasBus !== undefined)
        filters.hasBus = hasBus === "true";
    if (search)
        filters.search = search;
    const result = await routeService_1.RouteService.getRoutes(filters, parseInt(page, 10), parseInt(limit, 10));
    res.status(200).json({
        success: true,
        data: result.routes,
        meta: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
        },
    });
});
// Update route
RouteController.updateRoute = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const route = await routeService_1.RouteService.updateRoute(id, updateData);
    res.status(200).json({
        success: true,
        message: "Route updated successfully",
        data: route,
    });
});
// Delete route
RouteController.deleteRoute = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    await routeService_1.RouteService.deleteRoute(id);
    res.status(200).json({
        success: true,
        message: "Route deleted successfully",
    });
});
// Create route stop
RouteController.createRouteStop = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const stopData = req.body;
    const stop = await routeService_1.RouteService.createRouteStop(stopData);
    res.status(201).json({
        success: true,
        message: "Route stop created successfully",
        data: stop,
    });
});
// Update route stop
RouteController.updateRouteStop = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { stopId } = req.params;
    const updateData = req.body;
    const stop = await routeService_1.RouteService.updateRouteStop(stopId, updateData);
    res.status(200).json({
        success: true,
        message: "Route stop updated successfully",
        data: stop,
    });
});
// Delete route stop
RouteController.deleteRouteStop = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { stopId } = req.params;
    await routeService_1.RouteService.deleteRouteStop(stopId);
    res.status(200).json({
        success: true,
        message: "Route stop deleted successfully",
    });
});
// Assign student to route
RouteController.assignStudentToRoute = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const assignmentData = req.body;
    const assignment = await routeService_1.RouteService.assignStudentToRoute(assignmentData);
    res.status(201).json({
        success: true,
        message: "Student assigned to route successfully",
        data: assignment,
    });
});
// Unassign student from route
RouteController.unassignStudentFromRoute = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { studentId, routeId } = req.params;
    await routeService_1.RouteService.unassignStudentFromRoute(studentId, routeId);
    res.status(200).json({
        success: true,
        message: "Student unassigned from route successfully",
    });
});
// Get route statistics
RouteController.getRouteStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const stats = await routeService_1.RouteService.getRouteStats(id);
    res.status(200).json({
        success: true,
        data: stats,
    });
});
// Get routes by school
RouteController.getRoutesBySchool = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { schoolId } = req.params;
    const routes = await routeService_1.RouteService.getRoutesBySchool(schoolId);
    res.status(200).json({
        success: true,
        data: routes,
    });
});
// Get student's route assignments
RouteController.getStudentAssignments = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { studentId } = req.params;
    const assignments = await routeService_1.RouteService.getStudentAssignments(studentId);
    res.status(200).json({
        success: true,
        data: assignments,
    });
});
// Reorder route stops
RouteController.reorderRouteStops = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { stopOrders } = req.body;
    if (!stopOrders || !Array.isArray(stopOrders)) {
        res.status(400).json({
            success: false,
            message: "stopOrders array is required",
        });
        return;
    }
    const stops = await routeService_1.RouteService.reorderRouteStops(id, stopOrders);
    res.status(200).json({
        success: true,
        message: "Route stops reordered successfully",
        data: stops,
    });
});
// Get route stops
RouteController.getRouteStops = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const route = await routeService_1.RouteService.getRouteById(id);
    res.status(200).json({
        success: true,
        data: route.stops,
    });
});
// Get route assignments
RouteController.getRouteAssignments = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const route = await routeService_1.RouteService.getRouteById(id);
    res.status(200).json({
        success: true,
        data: route.assignments,
    });
});
//# sourceMappingURL=routeController.js.map