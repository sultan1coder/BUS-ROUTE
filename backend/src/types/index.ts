import { Request } from "express";
import {
  UserRole,
  NotificationType,
  TripStatus,
  AlertSeverity,
  AttendanceStatus,
} from "@prisma/client";

// Re-export Prisma enums for convenience
export {
  UserRole,
  NotificationType,
  TripStatus,
  AlertSeverity,
  AttendanceStatus,
};

// Extend Express Request to include user information
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string;
  };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Location types
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  timestamp?: Date;
}

export interface GPSData {
  busId: string;
  location: Location;
  speed?: number;
  heading?: number;
  accuracy?: number;
  timestamp: Date;
}

// Route types
export interface RouteStop {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  sequence: number;
  pickupTime?: string;
  dropTime?: string;
  estimatedArrival?: Date;
}

export interface Route {
  id: string;
  name: string;
  description?: string;
  stops: RouteStop[];
  distance?: number;
  estimatedDuration?: number;
}

// Notification types
export interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  priority?: AlertSeverity;
}

export interface PushNotificationData {
  to: string | string[];
  title: string;
  body: string;
  data?: any;
  priority?: "normal" | "high";
}

// Trip types
export interface TripData {
  id: string;
  routeId: string;
  busId: string;
  driverId: string;
  scheduledStart: Date;
  actualStart?: Date;
  scheduledEnd: Date;
  actualEnd?: Date;
  status: TripStatus;
  distance?: number;
  notes?: string;
}

// Attendance types
export interface AttendanceRecord {
  studentId: string;
  tripId: string;
  pickupTime?: Date;
  dropTime?: Date;
  status: AttendanceStatus;
  notes?: string;
}

// Emergency types
export interface EmergencyAlert {
  id: string;
  busId?: string;
  driverId?: string;
  type: string;
  severity: AlertSeverity;
  description: string;
  location?: Location;
  timestamp: Date;
}

// Geofence types
export interface GeofenceData {
  id: string;
  busId: string;
  name: string;
  center: Location;
  radius: number;
  isActive: boolean;
  alertOnEnter: boolean;
  alertOnExit: boolean;
}

// Validation types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// File upload types
export interface FileUploadResult {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
}

// Socket.IO event types
export interface ServerToClientEvents {
  bus_location: (data: GPSData) => void;
  notification: (notification: NotificationPayload) => void;
  emergency_alert: (alert: EmergencyAlert) => void;
  trip_update: (trip: TripData) => void;
}

export interface ClientToServerEvents {
  join: (data: { userType: string; userId: string }) => void;
  location_update: (data: GPSData) => void;
  emergency: (data: EmergencyAlert) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
  userType: string;
}

// Service response types
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

// Email types
export interface EmailData {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

// SMS types
export interface SMSData {
  to: string;
  message: string;
  priority?: "normal" | "high";
}

// Cache types
export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  key?: string; // Custom cache key
}

// Rate limiting types
export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}
