import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest, ApiResponse } from "../types";
import {
  AuthService,
  RegisterUserData,
  LoginData,
} from "../services/authService";
import { asyncHandler } from "../middleware/errorHandler";

export class AuthController {
  // Register new user
  static register = asyncHandler(
    async (req: Request, res: Response<ApiResponse>): Promise<void> => {
      const userData: RegisterUserData = req.body;

      const result = await AuthService.register(userData);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: result,
      });
    }
  );

  // Login user
  static login = asyncHandler(
    async (req: Request, res: Response<ApiResponse>): Promise<void> => {
      const loginData: LoginData = req.body;

      const result = await AuthService.login(loginData);

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    }
  );

  // Refresh access token
  static refreshToken = asyncHandler(
    async (req: Request, res: Response<ApiResponse>): Promise<void> => {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: "Refresh token is required",
        });
        return;
      }

      const result = await AuthService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        data: result,
      });
    }
  );

  // Change password
  static changePassword = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user!.id;

      await AuthService.changePassword(userId, currentPassword, newPassword);

      res.status(200).json({
        success: true,
        message: "Password changed successfully",
      });
    }
  );

  // Get user profile
  static getProfile = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const userId = req.user!.id;

      const profile = await AuthService.getProfile(userId);

      if (!profile) {
        res.status(404).json({
          success: false,
          message: "User profile not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: profile,
      });
    }
  );

  // Update user profile
  static updateProfile = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const userId = req.user!.id;
      const updateData = req.body;

      const updatedProfile = await AuthService.updateProfile(
        userId,
        updateData
      );

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: updatedProfile,
      });
    }
  );

  // Deactivate account
  static deactivateAccount = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      const userId = req.user!.id;

      await AuthService.deactivateAccount(userId);

      res.status(200).json({
        success: true,
        message: "Account deactivated successfully",
      });
    }
  );

  // Logout (client-side token removal)
  static logout = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      // In a stateless JWT system, logout is handled client-side
      // Optionally, you could implement token blacklisting here

      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    }
  );

  // Validate token (middleware will handle the actual validation)
  static validateToken = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response<ApiResponse>
    ): Promise<void> => {
      res.status(200).json({
        success: true,
        message: "Token is valid",
        data: {
          user: req.user,
        },
      });
    }
  );
}
