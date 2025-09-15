import { Response, NextFunction } from "express";
import { AuthenticatedRequest, ApiResponse, PaginatedResponse } from "../types";
import {
  BusService,
  CreateBusData,
  UpdateBusData,
  BusFilters,
} from "../services/busService";
import { asyncHandler } from "../middleware/errorHandler";

export class BusController {
  // Create a new bus
  static createBus = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const busData: CreateBusData = req.body;

      const bus = await BusService.createBus(busData);

      res.status(201).json({
        success: true,
        message: "Bus created successfully",
        data: bus,
      });
    }
  );

  // Get bus by ID
  static getBusById = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { id } = req.params;

      const bus = await BusService.getBusById(id);

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
    }
  );

  // Get all buses with filtering and pagination
  static getBuses = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<PaginatedResponse<any>>
    ): Promise<void> => {
      const {
        schoolId,
        isActive,
        driverId,
        search,
        page = 1,
        limit = 10,
      } = req.query;

      const filters: BusFilters = {};

      if (schoolId) filters.schoolId = schoolId as string;
      if (isActive !== undefined) filters.isActive = isActive === "true";
      if (driverId) filters.driverId = driverId as string;
      if (search) filters.search = search as string;

      const result = await BusService.getBuses(
        filters,
        parseInt(page as string, 10),
        parseInt(limit as string, 10)
      );

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
    }
  );

  // Update bus
  static updateBus = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { id } = req.params;
      const updateData: UpdateBusData = req.body;

      const bus = await BusService.updateBus(id, updateData);

      res.status(200).json({
        success: true,
        message: "Bus updated successfully",
        data: bus,
      });
    }
  );

  // Delete bus
  static deleteBus = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { id } = req.params;

      await BusService.deleteBus(id);

      res.status(200).json({
        success: true,
        message: "Bus deleted successfully",
      });
    }
  );

  // Assign driver to bus
  static assignDriver = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { id } = req.params;
      const { driverId } = req.body;

      if (!driverId) {
        res.status(400).json({
          success: false,
          message: "Driver ID is required",
        });
        return;
      }

      const bus = await BusService.assignDriver(id, driverId);

      res.status(200).json({
        success: true,
        message: "Driver assigned to bus successfully",
        data: bus,
      });
    }
  );

  // Unassign driver from bus
  static unassignDriver = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { id } = req.params;

      const bus = await BusService.unassignDriver(id);

      res.status(200).json({
        success: true,
        message: "Driver unassigned from bus successfully",
        data: bus,
      });
    }
  );

  // Get bus statistics
  static getBusStats = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { id } = req.params;

      const stats = await BusService.getBusStats(id);

      res.status(200).json({
        success: true,
        data: stats,
      });
    }
  );

  // Get buses by school
  static getBusesBySchool = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { schoolId } = req.params;

      const buses = await BusService.getBusesBySchool(schoolId);

      res.status(200).json({
        success: true,
        data: buses,
      });
    }
  );
}
