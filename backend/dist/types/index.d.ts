import { Request } from "express";
import { UserRole, NotificationType, TripStatus, AlertSeverity, AttendanceStatus } from "@prisma/client";
export { UserRole, NotificationType, TripStatus, AlertSeverity, AttendanceStatus, };
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: UserRole;
        firstName: string;
        lastName: string;
    };
}
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
export interface AttendanceRecord {
    studentId: string;
    tripId: string;
    pickupTime?: Date;
    dropTime?: Date;
    status: AttendanceStatus;
    notes?: string;
}
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
export interface ValidationError {
    field: string;
    message: string;
    value?: any;
}
export interface FileUploadResult {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
}
export interface ServerToClientEvents {
    bus_location: (data: GPSData) => void;
    notification: (notification: NotificationPayload) => void;
    emergency_alert: (alert: EmergencyAlert) => void;
    trip_update: (trip: TripData) => void;
}
export interface ClientToServerEvents {
    join: (data: {
        userType: string;
        userId: string;
    }) => void;
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
export interface ServiceResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    code?: string;
}
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
export interface SMSData {
    to: string;
    message: string;
    priority?: "normal" | "high";
}
export interface CacheOptions {
    ttl?: number;
    key?: string;
}
export interface RateLimitOptions {
    windowMs: number;
    max: number;
    message?: string;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
}
//# sourceMappingURL=index.d.ts.map