import { Response, NextFunction } from "express";
import { AuthenticatedRequest, ApiResponse, PaginatedResponse } from "../types";
import {
  GPSTrackingService,
  GPSData,
  LocationHistoryFilters,
} from "../services/gpsTrackingService";
import { asyncHandler } from "../middleware/errorHandler";
import prisma from "../config/database";

export class GPSTrackingController {
  // Record GPS location data
  static recordLocation = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const gpsData: GPSData = req.body;

      const trackingRecord = await GPSTrackingService.recordLocation(gpsData);

      res.status(201).json({
        success: true,
        message: "GPS location recorded successfully",
        data: trackingRecord,
      });
    }
  );

  // Get current location of a bus
  static getCurrentLocation = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { busId } = req.params;

      const location = await GPSTrackingService.getCurrentLocation(busId);

      res.status(200).json({
        success: true,
        data: location,
      });
    }
  );

  // Get location history for a bus
  static getLocationHistory = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<PaginatedResponse<any>>
    ): Promise<void> => {
      const { busId } = req.params;
      const { startDate, endDate, tripId, page = 1, limit = 100 } = req.query;

      const filters: LocationHistoryFilters = {
        busId,
      };

      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (tripId) filters.tripId = tripId as string;

      const result = await GPSTrackingService.getLocationHistory(
        filters,
        parseInt(page as string, 10),
        parseInt(limit as string, 10)
      );

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
    }
  );

  // Get multiple buses' current locations
  static getMultipleBusLocations = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
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

      const locations = await GPSTrackingService.getMultipleBusLocations(
        busIdArray
      );

      res.status(200).json({
        success: true,
        data: locations,
      });
    }
  );

  // Analyze speed patterns for a bus
  static analyzeSpeed = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { busId } = req.params;
      const { startDate, endDate } = req.query;

      const analysis = await GPSTrackingService.analyzeSpeed(
        busId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.status(200).json({
        success: true,
        data: analysis,
      });
    }
  );

  // Check geofence status for a bus
  static checkGeofenceStatus = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { busId } = req.params;

      const geofenceStatus = await GPSTrackingService.checkGeofenceStatus(
        busId
      );

      res.status(200).json({
        success: true,
        data: geofenceStatus,
      });
    }
  );

  // Calculate ETA to next stop
  static calculateETA = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { busId } = req.params;

      const etaData = await GPSTrackingService.calculateETA(busId);

      res.status(200).json({
        success: true,
        data: etaData,
      });
    }
  );

  // Get tracking statistics for a bus
  static getTrackingStats = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { busId } = req.params;
      const { days = 30 } = req.query;

      const stats = await GPSTrackingService.getTrackingStats(
        busId,
        parseInt(days as string, 10)
      );

      res.status(200).json({
        success: true,
        data: stats,
      });
    }
  );

  // Get bus route for navigation
  static getBusRoute = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { busId } = req.params;

      const route = await GPSTrackingService.getBusRoute(busId);

      res.status(200).json({
        success: true,
        data: route,
      });
    }
  );

  // Clean up old tracking data (admin only)
  static cleanupOldData = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { daysToKeep = 90 } = req.query;

      const deletedCount = await GPSTrackingService.cleanupOldData(
        parseInt(daysToKeep as string, 10)
      );

      res.status(200).json({
        success: true,
        message: `Cleaned up ${deletedCount} old tracking records`,
        data: { deletedCount },
      });
    }
  );

  // Bulk location update (for multiple buses)
  static bulkRecordLocations = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
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
          const result = await GPSTrackingService.recordLocation(locationData);
          results.push({
            success: true,
            busId: locationData.busId,
            data: result,
          });
        } catch (error: any) {
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
    }
  );

  // Get real-time dashboard data
  static getDashboardData = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { schoolId } = req.query;

      // Get all active buses for the school
      const buses = await prisma.bus.findMany({
        where: {
          ...(schoolId && { schoolId: schoolId as string }),
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
      const locations = await GPSTrackingService.getMultipleBusLocations(
        busIds
      );

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
    }
  );
}
