// User Types
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

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "SCHOOL_STAFF" | "DRIVER" | "PARENT";
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    refreshToken: string;
  };
}

// Bus Types
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

// Driver Types
export interface Driver {
  id: string;
  userId: string;
  licenseNumber: string;
  licenseExpiry: string;
  experience: number;
  isActive: boolean;
  user?: User;
}

// Route Types
export interface Route {
  id: string;
  name: string;
  description?: string;
  schoolId: string;
  totalDistance: number;
  estimatedDuration: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  stops?: RouteStop[];
}

export interface RouteStop {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  pickupTime: string;
  dropTime: string;
  order: number;
}

// Student Types
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

// School Types
export interface School {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  isActive: boolean;
}

// Trip Types
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

// GPS Tracking Types
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

// Notification Types
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

// Emergency Alert Types
export interface EmergencyAlert {
  id: string;
  busId?: string;
  driverId?: string;
  type: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
  location?: string;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Attendance Types
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

// Dashboard Types
export interface DashboardStats {
  totalUsers: number;
  totalBuses: number;
  totalDrivers: number;
  totalStudents: number;
  totalSchools: number;
  activeTrips: number;
  activeAlerts: number;
  systemHealth: "GOOD" | "WARNING" | "CRITICAL";
  uptime: number;
  lastUpdated: Date;
}

// API Response Types
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

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "SCHOOL_STAFF" | "DRIVER" | "PARENT";
  phone?: string;
}
