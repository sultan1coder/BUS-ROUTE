import { Response, NextFunction } from "express";
import { AuthenticatedRequest, ApiResponse, PaginatedResponse } from "../types";
import {
  RouteService,
  CreateRouteData,
  UpdateRouteData,
  CreateRouteStopData,
  UpdateRouteStopData,
  RouteFilters,
  StudentRouteAssignmentData,
} from "../services/routeService";
import { asyncHandler } from "../middleware/errorHandler";

export class RouteController {
  // Create a new route
  static createRoute = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const routeData: CreateRouteData = req.body;

      const route = await RouteService.createRoute(routeData);

      res.status(201).json({
        success: true,
        message: "Route created successfully",
        data: route,
      });
    }
  );

  // Get route by ID
  static getRouteById = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { id } = req.params;

      const route = await RouteService.getRouteById(id);

      res.status(200).json({
        success: true,
        data: route,
      });
    }
  );

  // Get all routes with filtering and pagination
  static getRoutes = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<PaginatedResponse<any>>
    ): Promise<void> => {
      const {
        schoolId,
        isActive,
        hasBus,
        search,
        page = 1,
        limit = 10,
      } = req.query;

      const filters: RouteFilters = {};

      if (schoolId) filters.schoolId = schoolId as string;
      if (isActive !== undefined) filters.isActive = isActive === "true";
      if (hasBus !== undefined) filters.hasBus = hasBus === "true";
      if (search) filters.search = search as string;

      const result = await RouteService.getRoutes(
        filters,
        parseInt(page as string, 10),
        parseInt(limit as string, 10)
      );

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
    }
  );

  // Update route
  static updateRoute = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { id } = req.params;
      const updateData: UpdateRouteData = req.body;

      const route = await RouteService.updateRoute(id, updateData);

      res.status(200).json({
        success: true,
        message: "Route updated successfully",
        data: route,
      });
    }
  );

  // Delete route
  static deleteRoute = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { id } = req.params;

      await RouteService.deleteRoute(id);

      res.status(200).json({
        success: true,
        message: "Route deleted successfully",
      });
    }
  );

  // Create route stop
  static createRouteStop = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const stopData: CreateRouteStopData = req.body;

      const stop = await RouteService.createRouteStop(stopData);

      res.status(201).json({
        success: true,
        message: "Route stop created successfully",
        data: stop,
      });
    }
  );

  // Update route stop
  static updateRouteStop = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { stopId } = req.params;
      const updateData: UpdateRouteStopData = req.body;

      const stop = await RouteService.updateRouteStop(stopId, updateData);

      res.status(200).json({
        success: true,
        message: "Route stop updated successfully",
        data: stop,
      });
    }
  );

  // Delete route stop
  static deleteRouteStop = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { stopId } = req.params;

      await RouteService.deleteRouteStop(stopId);

      res.status(200).json({
        success: true,
        message: "Route stop deleted successfully",
      });
    }
  );

  // Assign student to route
  static assignStudentToRoute = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const assignmentData: StudentRouteAssignmentData = req.body;

      const assignment = await RouteService.assignStudentToRoute(
        assignmentData
      );

      res.status(201).json({
        success: true,
        message: "Student assigned to route successfully",
        data: assignment,
      });
    }
  );

  // Unassign student from route
  static unassignStudentFromRoute = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { studentId, routeId } = req.params;

      await RouteService.unassignStudentFromRoute(studentId, routeId);

      res.status(200).json({
        success: true,
        message: "Student unassigned from route successfully",
      });
    }
  );

  // Get route statistics
  static getRouteStats = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { id } = req.params;

      const stats = await RouteService.getRouteStats(id);

      res.status(200).json({
        success: true,
        data: stats,
      });
    }
  );

  // Get routes by school
  static getRoutesBySchool = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { schoolId } = req.params;

      const routes = await RouteService.getRoutesBySchool(schoolId);

      res.status(200).json({
        success: true,
        data: routes,
      });
    }
  );

  // Get student's route assignments
  static getStudentAssignments = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { studentId } = req.params;

      const assignments = await RouteService.getStudentAssignments(studentId);

      res.status(200).json({
        success: true,
        data: assignments,
      });
    }
  );

  // Reorder route stops
  static reorderRouteStops = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { id } = req.params;
      const { stopOrders } = req.body;

      if (!stopOrders || !Array.isArray(stopOrders)) {
        res.status(400).json({
          success: false,
          message: "stopOrders array is required",
        });
        return;
      }

      const stops = await RouteService.reorderRouteStops(id, stopOrders);

      res.status(200).json({
        success: true,
        message: "Route stops reordered successfully",
        data: stops,
      });
    }
  );

  // Get route stops
  static getRouteStops = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { id } = req.params;

      const route = await RouteService.getRouteById(id);

      res.status(200).json({
        success: true,
        data: route.stops,
      });
    }
  );

  // Get route assignments
  static getRouteAssignments = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { id } = req.params;

      const route = await RouteService.getRouteById(id);

      res.status(200).json({
        success: true,
        data: route.assignments,
      });
    }
  );
}
