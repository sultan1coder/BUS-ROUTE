// Shared types for both Driver and Parent apps

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: "ADMIN" | "SCHOOL_STAFF" | "DRIVER" | "PARENT";
  isActive: boolean;
  avatar?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Bus {
  id: string;
  plateNumber: string;
  model: string;
  capacity: number;
  schoolId: string;
  driverId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  school?: School;
  driver?: Driver;
}

export interface Driver {
  id: string;
  userId: string;
  licenseNumber: string;
  licenseExpiry: string;
  experience: number;
  isActive: boolean;
  user?: User;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  grade: string;
  schoolId: string;
  parentId: string;
  rfidTag?: string;
  nfcTag?: string;
  emergencyContact?: string;
  medicalInfo?: string;
  photo?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  school?: School;
  parent?: User;
}

export interface School {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  isActive: boolean;
}

export interface Trip {
  id: string;
  routeId: string;
  busId: string;
  driverId: string;
  scheduledStart: Date;
  actualStart?: Date;
  scheduledEnd: Date;
  actualEnd?: Date;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "DELAYED";
  distance?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LocationData {
  busId: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  accuracy: number;
  timestamp: Date;
  address?: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  recipientId: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  isRead: boolean;
  readAt?: Date;
  sentAt: Date;
  data?: any;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  tripId: string;
  busId: string;
  pickupTime?: Date;
  dropTime?: Date;
  pickupStopId?: string;
  dropStopId?: string;
  status: "PICKED_UP" | "DROPPED_OFF" | "ABSENT";
  notes?: string;
}

// Mobile app specific types
export interface AppState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface LocationPermission {
  granted: boolean;
  canAskAgain: boolean;
  status: "granted" | "denied" | "blocked" | "unavailable";
}

export interface PushNotificationData {
  title: string;
  body: string;
  data?: any;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
