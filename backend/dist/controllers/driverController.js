"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverController = void 0;
const driverService_1 = require("../services/driverService");
const errorHandler_1 = require("../middleware/errorHandler");
class DriverController {
}
exports.DriverController = DriverController;
_a = DriverController;
// Create a new driver profile
DriverController.createDriver = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const driverData = req.body;
    const driver = await driverService_1.DriverService.createDriver(driverData);
    res.status(201).json({
        success: true,
        message: "Driver profile created successfully",
        data: driver,
    });
});
// Get driver by ID
DriverController.getDriverById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const driver = await driverService_1.DriverService.getDriverById(id);
    if (!driver) {
        res.status(404).json({
            success: false,
            message: "Driver not found",
        });
        return;
    }
    res.status(200).json({
        success: true,
        data: driver,
    });
});
// Get driver profile for current user (if they are a driver)
DriverController.getMyProfile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const driver = await driverService_1.DriverService.getDriverByUserId(userId);
    if (!driver) {
        res.status(404).json({
            success: false,
            message: "Driver profile not found",
        });
        return;
    }
    res.status(200).json({
        success: true,
        data: driver,
    });
});
// Get all drivers with filtering and pagination
DriverController.getDrivers = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { isActive, hasBus, search, page = 1, limit = 10 } = req.query;
    const filters = {};
    if (isActive !== undefined)
        filters.isActive = isActive === "true";
    if (hasBus !== undefined)
        filters.hasBus = hasBus === "true";
    if (search)
        filters.search = search;
    const result = await driverService_1.DriverService.getDrivers(filters, parseInt(page, 10), parseInt(limit, 10));
    res.status(200).json({
        success: true,
        data: result.drivers,
        meta: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
        },
    });
});
// Update driver
DriverController.updateDriver = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const driver = await driverService_1.DriverService.updateDriver(id, updateData);
    res.status(200).json({
        success: true,
        message: "Driver updated successfully",
        data: driver,
    });
});
// Update current driver's profile
DriverController.updateMyProfile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const updateData = req.body;
    // First get the driver ID for this user
    const driver = await driverService_1.DriverService.getDriverByUserId(userId);
    if (!driver) {
        res.status(404).json({
            success: false,
            message: "Driver profile not found",
        });
        return;
    }
    const updatedDriver = await driverService_1.DriverService.updateDriver(driver.id, updateData);
    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: updatedDriver,
    });
});
// Delete driver
DriverController.deleteDriver = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    await driverService_1.DriverService.deleteDriver(id);
    res.status(200).json({
        success: true,
        message: "Driver deleted successfully",
    });
});
// Assign driver to bus
DriverController.assignToBus = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { busId } = req.body;
    if (!busId) {
        res.status(400).json({
            success: false,
            message: "Bus ID is required",
        });
        return;
    }
    const driver = await driverService_1.DriverService.assignToBus(id, busId);
    res.status(200).json({
        success: true,
        message: "Driver assigned to bus successfully",
        data: driver,
    });
});
// Unassign driver from bus
DriverController.unassignFromBus = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const driver = await driverService_1.DriverService.unassignFromBus(id);
    res.status(200).json({
        success: true,
        message: "Driver unassigned from bus successfully",
        data: driver,
    });
});
// Get driver statistics
DriverController.getDriverStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const stats = await driverService_1.DriverService.getDriverStats(id);
    res.status(200).json({
        success: true,
        data: stats,
    });
});
// Get current driver's statistics
DriverController.getMyStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const driver = await driverService_1.DriverService.getDriverByUserId(userId);
    if (!driver) {
        res.status(404).json({
            success: false,
            message: "Driver profile not found",
        });
        return;
    }
    const stats = await driverService_1.DriverService.getDriverStats(driver.id);
    res.status(200).json({
        success: true,
        data: stats,
    });
});
// Get available drivers (not assigned to any bus)
DriverController.getAvailableDrivers = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const drivers = await driverService_1.DriverService.getAvailableDrivers();
    res.status(200).json({
        success: true,
        data: drivers,
    });
});
// Get drivers with expiring licenses
DriverController.getDriversWithExpiringLicenses = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { daysAhead = 30 } = req.query;
    const drivers = await driverService_1.DriverService.getDriversWithExpiringLicenses(parseInt(daysAhead, 10));
    res.status(200).json({
        success: true,
        data: drivers,
    });
});
//# sourceMappingURL=driverController.js.map