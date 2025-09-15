"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GPSTrackingController = void 0;
const gpsTrackingService_1 = require("../services/gpsTrackingService");
const errorHandler_1 = require("../middleware/errorHandler");
const database_1 = __importDefault(require("../config/database"));
class GPSTrackingController {
}
exports.GPSTrackingController = GPSTrackingController;
_a = GPSTrackingController;
// Record GPS location data
GPSTrackingController.recordLocation = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const gpsData = req.body;
    const trackingRecord = await gpsTrackingService_1.GPSTrackingService.recordLocation(gpsData);
    res.status(201).json({
        success: true,
        message: "GPS location recorded successfully",
        data: trackingRecord,
    });
});
// Get current location of a bus
GPSTrackingController.getCurrentLocation = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { busId } = req.params;
    const location = await gpsTrackingService_1.GPSTrackingService.getCurrentLocation(busId);
    res.status(200).json({
        success: true,
        data: location,
    });
});
// Get location history for a bus
GPSTrackingController.getLocationHistory = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { busId } = req.params;
    const { startDate, endDate, tripId, page = 1, limit = 100 } = req.query;
    const filters = {
        busId,
    };
    if (startDate)
        filters.startDate = new Date(startDate);
    if (endDate)
        filters.endDate = new Date(endDate);
    if (tripId)
        filters.tripId = tripId;
    const result = await gpsTrackingService_1.GPSTrackingService.getLocationHistory(filters, parseInt(page, 10), parseInt(limit, 10));
    res.status(200).json({
        success: true,
        data: result.locations,
        meta: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
        },
    });
});
// Get multiple buses' current locations
GPSTrackingController.getMultipleBusLocations = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { busIds } = req.query;
    if (!busIds) {
        res.status(400).json({
            success: false,
            message: "busIds parameter is required",
        });
        return;
    }
    const busIdArray = Array.isArray(busIds)
        ? busIds.map((id) => String(id))
        : [String(busIds)];
    const locations = await gpsTrackingService_1.GPSTrackingService.getMultipleBusLocations(busIdArray);
    res.status(200).json({
        success: true,
        data: locations,
    });
});
// Analyze speed patterns for a bus
GPSTrackingController.analyzeSpeed = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { busId } = req.params;
    const { startDate, endDate } = req.query;
    const analysis = await gpsTrackingService_1.GPSTrackingService.analyzeSpeed(busId, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
    res.status(200).json({
        success: true,
        data: analysis,
    });
});
// Check geofence status for a bus
GPSTrackingController.checkGeofenceStatus = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { busId } = req.params;
    const geofenceStatus = await gpsTrackingService_1.GPSTrackingService.checkGeofenceStatus(busId);
    res.status(200).json({
        success: true,
        data: geofenceStatus,
    });
});
// Calculate ETA to next stop
GPSTrackingController.calculateETA = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { busId } = req.params;
    const etaData = await gpsTrackingService_1.GPSTrackingService.calculateETA(busId);
    res.status(200).json({
        success: true,
        data: etaData,
    });
});
// Get tracking statistics for a bus
GPSTrackingController.getTrackingStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { busId } = req.params;
    const { days = 30 } = req.query;
    const stats = await gpsTrackingService_1.GPSTrackingService.getTrackingStats(busId, parseInt(days, 10));
    res.status(200).json({
        success: true,
        data: stats,
    });
});
// Get bus route for navigation
GPSTrackingController.getBusRoute = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { busId } = req.params;
    const route = await gpsTrackingService_1.GPSTrackingService.getBusRoute(busId);
    res.status(200).json({
        success: true,
        data: route,
    });
});
// Clean up old tracking data (admin only)
GPSTrackingController.cleanupOldData = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { daysToKeep = 90 } = req.query;
    const deletedCount = await gpsTrackingService_1.GPSTrackingService.cleanupOldData(parseInt(daysToKeep, 10));
    res.status(200).json({
        success: true,
        message: `Cleaned up ${deletedCount} old tracking records`,
        data: { deletedCount },
    });
});
// Bulk location update (for multiple buses)
GPSTrackingController.bulkRecordLocations = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { locations } = req.body;
    if (!Array.isArray(locations)) {
        res.status(400).json({
            success: false,
            message: "locations must be an array",
        });
        return;
    }
    const results = [];
    for (const locationData of locations) {
        try {
            const result = await gpsTrackingService_1.GPSTrackingService.recordLocation(locationData);
            results.push({
                success: true,
                busId: locationData.busId,
                data: result,
            });
        }
        catch (error) {
            results.push({
                success: false,
                busId: locationData.busId,
                error: error.message,
            });
        }
    }
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;
    res.status(200).json({
        success: true,
        message: `Processed ${locations.length} locations: ${successCount} successful, ${failureCount} failed`,
        data: {
            total: locations.length,
            successful: successCount,
            failed: failureCount,
            results,
        },
    });
});
// Get real-time dashboard data
GPSTrackingController.getDashboardData = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { schoolId } = req.query;
    // Get all active buses for the school
    const buses = await database_1.default.bus.findMany({
        where: {
            ...(schoolId && { schoolId: schoolId }),
            isActive: true,
        },
        select: {
            id: true,
            plateNumber: true,
            school: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
    // Get current locations for all buses
    const busIds = buses.map((bus) => bus.id);
    const locations = await gpsTrackingService_1.GPSTrackingService.getMultipleBusLocations(busIds);
    // Create a map of bus locations
    const locationMap = new Map();
    locations.forEach((location) => {
        locationMap.set(location.busId, location);
    });
    // Combine bus data with location data
    const dashboardData = buses.map((bus) => ({
        ...bus,
        location: locationMap.get(bus.id) || null,
        hasLocation: locationMap.has(bus.id),
    }));
    res.status(200).json({
        success: true,
        data: {
            totalBuses: buses.length,
            busesWithLocation: locations.length,
            busesWithoutLocation: buses.length - locations.length,
            buses: dashboardData,
        },
    });
});
//# sourceMappingURL=gpsTrackingController.js.map