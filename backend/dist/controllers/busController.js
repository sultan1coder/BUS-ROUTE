"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusController = void 0;
const busService_1 = require("../services/busService");
const errorHandler_1 = require("../middleware/errorHandler");
class BusController {
}
exports.BusController = BusController;
_a = BusController;
// Create a new bus
BusController.createBus = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const busData = req.body;
    const bus = await busService_1.BusService.createBus(busData);
    res.status(201).json({
        success: true,
        message: "Bus created successfully",
        data: bus,
    });
});
// Get bus by ID
BusController.getBusById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const bus = await busService_1.BusService.getBusById(id);
    if (!bus) {
        res.status(404).json({
            success: false,
            message: "Bus not found",
        });
        return;
    }
    res.status(200).json({
        success: true,
        data: bus,
    });
});
// Get all buses with filtering and pagination
BusController.getBuses = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { schoolId, isActive, driverId, search, page = 1, limit = 10, } = req.query;
    const filters = {};
    if (schoolId)
        filters.schoolId = schoolId;
    if (isActive !== undefined)
        filters.isActive = isActive === "true";
    if (driverId)
        filters.driverId = driverId;
    if (search)
        filters.search = search;
    const result = await busService_1.BusService.getBuses(filters, parseInt(page, 10), parseInt(limit, 10));
    res.status(200).json({
        success: true,
        data: result.buses,
        meta: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
        },
    });
});
// Update bus
BusController.updateBus = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const bus = await busService_1.BusService.updateBus(id, updateData);
    res.status(200).json({
        success: true,
        message: "Bus updated successfully",
        data: bus,
    });
});
// Delete bus
BusController.deleteBus = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    await busService_1.BusService.deleteBus(id);
    res.status(200).json({
        success: true,
        message: "Bus deleted successfully",
    });
});
// Assign driver to bus
BusController.assignDriver = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { driverId } = req.body;
    if (!driverId) {
        res.status(400).json({
            success: false,
            message: "Driver ID is required",
        });
        return;
    }
    const bus = await busService_1.BusService.assignDriver(id, driverId);
    res.status(200).json({
        success: true,
        message: "Driver assigned to bus successfully",
        data: bus,
    });
});
// Unassign driver from bus
BusController.unassignDriver = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const bus = await busService_1.BusService.unassignDriver(id);
    res.status(200).json({
        success: true,
        message: "Driver unassigned from bus successfully",
        data: bus,
    });
});
// Get bus statistics
BusController.getBusStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const stats = await busService_1.BusService.getBusStats(id);
    res.status(200).json({
        success: true,
        data: stats,
    });
});
// Get buses by school
BusController.getBusesBySchool = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { schoolId } = req.params;
    const buses = await busService_1.BusService.getBusesBySchool(schoolId);
    res.status(200).json({
        success: true,
        data: buses,
    });
});
//# sourceMappingURL=busController.js.map