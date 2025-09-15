import { Response, NextFunction } from "express";
import { AuthenticatedRequest, ApiResponse, PaginatedResponse } from "../types";
import {
  DriverService,
  CreateDriverData,
  UpdateDriverData,
  DriverFilters,
} from "../services/driverService";
import { asyncHandler } from "../middleware/errorHandler";

export class DriverController {
  // Create a new driver profile
  static createDriver = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const driverData: CreateDriverData = req.body;

      const driver = await DriverService.createDriver(driverData);

      res.status(201).json({
        success: true,
        message: "Driver profile created successfully",
        data: driver,
      });
    }
  );

  // Get driver by ID
  static getDriverById = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { id } = req.params;

      const driver = await DriverService.getDriverById(id);

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
    }
  );

  // Get driver profile for current user (if they are a driver)
  static getMyProfile = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const userId = req.user!.id;

      const driver = await DriverService.getDriverByUserId(userId);

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
    }
  );

  // Get all drivers with filtering and pagination
  static getDrivers = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<PaginatedResponse<any>>
    ): Promise<void> => {
      const { isActive, hasBus, search, page = 1, limit = 10 } = req.query;

      const filters: DriverFilters = {};

      if (isActive !== undefined) filters.isActive = isActive === "true";
      if (hasBus !== undefined) filters.hasBus = hasBus === "true";
      if (search) filters.search = search as string;

      const result = await DriverService.getDrivers(
        filters,
        parseInt(page as string, 10),
        parseInt(limit as string, 10)
      );

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
    }
  );

  // Update driver
  static updateDriver = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { id } = req.params;
      const updateData: UpdateDriverData = req.body;

      const driver = await DriverService.updateDriver(id, updateData);

      res.status(200).json({
        success: true,
        message: "Driver updated successfully",
        data: driver,
      });
    }
  );

  // Update current driver's profile
  static updateMyProfile = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const userId = req.user!.id;
      const updateData: UpdateDriverData = req.body;

      // First get the driver ID for this user
      const driver = await DriverService.getDriverByUserId(userId);
      if (!driver) {
        res.status(404).json({
          success: false,
          message: "Driver profile not found",
        });
        return;
      }

      const updatedDriver = await DriverService.updateDriver(
        driver.id,
        updateData
      );

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: updatedDriver,
      });
    }
  );

  // Delete driver
  static deleteDriver = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { id } = req.params;

      await DriverService.deleteDriver(id);

      res.status(200).json({
        success: true,
        message: "Driver deleted successfully",
      });
    }
  );

  // Assign driver to bus
  static assignToBus = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { id } = req.params;
      const { busId } = req.body;

      if (!busId) {
        res.status(400).json({
          success: false,
          message: "Bus ID is required",
        });
        return;
      }

      const driver = await DriverService.assignToBus(id, busId);

      res.status(200).json({
        success: true,
        message: "Driver assigned to bus successfully",
        data: driver,
      });
    }
  );

  // Unassign driver from bus
  static unassignFromBus = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { id } = req.params;

      const driver = await DriverService.unassignFromBus(id);

      res.status(200).json({
        success: true,
        message: "Driver unassigned from bus successfully",
        data: driver,
      });
    }
  );

  // Get driver statistics
  static getDriverStats = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { id } = req.params;

      const stats = await DriverService.getDriverStats(id);

      res.status(200).json({
        success: true,
        data: stats,
      });
    }
  );

  // Get current driver's statistics
  static getMyStats = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const userId = req.user!.id;

      const driver = await DriverService.getDriverByUserId(userId);
      if (!driver) {
        res.status(404).json({
          success: false,
          message: "Driver profile not found",
        });
        return;
      }

      const stats = await DriverService.getDriverStats(driver.id);

      res.status(200).json({
        success: true,
        data: stats,
      });
    }
  );

  // Get available drivers (not assigned to any bus)
  static getAvailableDrivers = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const drivers = await DriverService.getAvailableDrivers();

      res.status(200).json({
        success: true,
        data: drivers,
      });
    }
  );

  // Get drivers with expiring licenses
  static getDriversWithExpiringLicenses = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { daysAhead = 30 } = req.query;

      const drivers = await DriverService.getDriversWithExpiringLicenses(
        parseInt(daysAhead as string, 10)
      );

      res.status(200).json({
        success: true,
        data: drivers,
      });
    }
  );
}
