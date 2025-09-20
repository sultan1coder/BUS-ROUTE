import api from "./api";

// Types for dashboard data
export interface DashboardStats {
  totalUsers: number;
  totalBuses: number;
  totalDrivers: number;
  totalStudents: number;
  activeTrips: number;
  activeAlerts: number;
}

export interface DashboardData {
  overview: DashboardStats;
  userAnalytics: UserAnalytics;
  fleetAnalytics: FleetAnalytics;
  safetyAnalytics: SafetyAnalytics;
  communicationAnalytics: CommunicationAnalytics;
  performanceMetrics: PerformanceMetrics;
  recentActivities: Activity[];
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  userId?: string;
  busId?: string;
  severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface SystemHealth {
  status: "GOOD" | "WARNING" | "CRITICAL";
  uptime: number;
  database: boolean;
  redis: boolean;
  lastUpdated: string;
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  usersByRole: Array<{
    role: string;
    count: number;
  }>;
  recentRegistrations: number;
  userGrowth: Array<{
    date: string;
    count: number;
  }>;
  topActiveUsers: any[];
}

export interface FleetAnalytics {
  totalBuses: number;
  activeBuses: number;
  busesByStatus: Array<{
    status: string;
    count: number;
  }>;
  averageBusUtilization: number;
  maintenanceAlerts: number;
  fuelEfficiency: number;
}

export interface SafetyAnalytics {
  totalAlerts: number;
  criticalAlerts: number;
  resolvedAlerts: number;
  averageResponseTime: number;
  safetyScore: number;
  alertsByType: Array<{
    type: string;
    count: number;
  }>;
}

export interface CommunicationAnalytics {
  totalMessages: number;
  messagesToday: number;
  responseRate: number;
  averageResponseTime: number;
  messagesByType: Array<{
    type: string;
    count: number;
  }>;
}

export interface PerformanceMetrics {
  systemUptime: number;
  averageResponseTime: number;
  databasePerformance: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
}

// Driver Types
export interface Driver {
  id: string;
  userId: string;
  licenseNumber: string;
  licenseExpiry: string;
  licenseType: string;
  experienceYears?: number;
  emergencyContact: string;
  emergencyPhone: string;
  medicalInfo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  bus?: {
    id: string;
    plateNumber: string;
    model: string;
  };
}

export interface CreateDriverData {
  userId: string;
  licenseNumber: string;
  licenseExpiry: string;
  licenseType: string;
  experienceYears?: number;
  emergencyContact: string;
  emergencyPhone: string;
  medicalInfo?: string;
}

export interface UpdateDriverData {
  licenseNumber?: string;
  licenseExpiry?: string;
  licenseType?: string;
  experienceYears?: number;
  emergencyContact?: string;
  emergencyPhone?: string;
  medicalInfo?: string;
}

export interface DriverStats {
  totalDrivers: number;
  activeDrivers: number;
  inactiveDrivers: number;
  driversByExperience: Array<{
    experience: string;
    count: number;
  }>;
  licenseExpiringSoon: number;
  recentHires: number;
}

export interface AvailableUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  isActive: boolean;
}

// Admin API Service Class
export class AdminApiService {
  // Get system overview
  static async getSystemOverview() {
    try {
      const response = await api.get("/admin/overview");
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch system overview:", error);
      throw error;
    }
  }

  // Get complete dashboard data
  static async getDashboardData(filters?: {
    schoolId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<DashboardData> {
    try {
      const params = new URLSearchParams();

      if (filters?.schoolId) params.append("schoolId", filters.schoolId);
      if (filters?.startDate) params.append("startDate", filters.startDate);
      if (filters?.endDate) params.append("endDate", filters.endDate);

      const queryString = params.toString();
      const url = `/admin/dashboard${queryString ? `?${queryString}` : ""}`;

      const response = await api.get(url);
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      throw error;
    }
  }

  // Get user analytics
  static async getUserAnalytics(dateRange?: {
    start: string;
    end: string;
  }): Promise<UserAnalytics> {
    try {
      const params = new URLSearchParams();

      if (dateRange?.start) params.append("startDate", dateRange.start);
      if (dateRange?.end) params.append("endDate", dateRange.end);

      const queryString = params.toString();
      const url = `/admin/analytics/users${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await api.get(url);
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch user analytics:", error);
      throw error;
    }
  }

  // Get fleet analytics
  static async getFleetAnalytics(dateRange?: {
    start: string;
    end: string;
  }): Promise<FleetAnalytics> {
    try {
      const params = new URLSearchParams();

      if (dateRange?.start) params.append("startDate", dateRange.start);
      if (dateRange?.end) params.append("endDate", dateRange.end);

      const queryString = params.toString();
      const url = `/admin/analytics/fleet${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await api.get(url);
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch fleet analytics:", error);
      throw error;
    }
  }

  // Get safety analytics
  static async getSafetyAnalytics(dateRange?: {
    start: string;
    end: string;
  }): Promise<SafetyAnalytics> {
    try {
      const params = new URLSearchParams();

      if (dateRange?.start) params.append("startDate", dateRange.start);
      if (dateRange?.end) params.append("endDate", dateRange.end);

      const queryString = params.toString();
      const url = `/admin/analytics/safety${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await api.get(url);
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch safety analytics:", error);
      throw error;
    }
  }

  // Get communication analytics
  static async getCommunicationAnalytics(dateRange?: {
    start: string;
    end: string;
  }): Promise<any> {
    try {
      const params = new URLSearchParams();

      if (dateRange?.start) params.append("startDate", dateRange.start);
      if (dateRange?.end) params.append("endDate", dateRange.end);

      const queryString = params.toString();
      const url = `/admin/analytics/communication${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await api.get(url);
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch communication analytics:", error);
      throw error;
    }
  }

  // Get performance metrics
  static async getPerformanceMetrics() {
    try {
      const response = await api.get("/admin/analytics/performance");
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch performance metrics:", error);
      throw error;
    }
  }

  // Get recent activities
  static async getRecentActivities(limit: number = 20): Promise<{
    activities: Activity[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    try {
      const response = await api.get(`/admin/activities?limit=${limit}`);
      return {
        activities: response.data.data,
        meta: response.data.meta,
      };
    } catch (error) {
      console.error("Failed to fetch recent activities:", error);
      throw error;
    }
  }

  // Get all users
  static async getAllUsers(filters?: {
    page?: number;
    limit?: number;
    role?: string;
    isActive?: boolean;
    search?: string;
    schoolId?: string;
  }) {
    try {
      const params = new URLSearchParams();

      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.role) params.append("role", filters.role);
      if (filters?.isActive !== undefined)
        params.append("isActive", filters.isActive.toString());
      if (filters?.search) params.append("search", filters.search);
      if (filters?.schoolId) params.append("schoolId", filters.schoolId);

      const queryString = params.toString();
      const url = `/admin/users${queryString ? `?${queryString}` : ""}`;

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch users:", error);
      throw error;
    }
  }

  // Get all buses
  static async getAllBuses(filters?: {
    page?: number;
    limit?: number;
    schoolId?: string;
    isActive?: boolean;
    search?: string;
  }) {
    try {
      const params = new URLSearchParams();

      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.schoolId) params.append("schoolId", filters.schoolId);
      if (filters?.isActive !== undefined)
        params.append("isActive", filters.isActive.toString());
      if (filters?.search) params.append("search", filters.search);

      const queryString = params.toString();
      const url = `/admin/buses${queryString ? `?${queryString}` : ""}`;

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch buses:", error);
      throw error;
    }
  }

  // Get all schools
  static async getAllSchools(filters?: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    try {
      const params = new URLSearchParams();

      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.search) params.append("search", filters.search);

      const queryString = params.toString();
      const url = `/admin/schools${queryString ? `?${queryString}` : ""}`;

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch schools:", error);
      throw error;
    }
  }

  // Update user
  static async updateUser(userId: string, updateData: any) {
    try {
      const response = await api.put(`/admin/users/${userId}`, updateData);
      return response.data;
    } catch (error) {
      console.error("Failed to update user:", error);
      throw error;
    }
  }

  // Deactivate user
  static async deactivateUser(userId: string) {
    try {
      const response = await api.put(`/admin/users/${userId}/deactivate`);
      return response.data;
    } catch (error) {
      console.error("Failed to deactivate user:", error);
      throw error;
    }
  }

  // Reactivate user
  static async reactivateUser(userId: string) {
    try {
      const response = await api.put(`/admin/users/${userId}/reactivate`);
      return response.data;
    } catch (error) {
      console.error("Failed to reactivate user:", error);
      throw error;
    }
  }

  // Get system settings
  static async getSystemSettings() {
    try {
      const response = await api.get("/admin/settings");
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch system settings:", error);
      throw error;
    }
  }

  // Update system settings
  static async updateSystemSettings(settings: any) {
    try {
      const response = await api.put("/admin/settings", settings);
      return response.data;
    } catch (error) {
      console.error("Failed to update system settings:", error);
      throw error;
    }
  }

  // Run system maintenance
  static async runSystemMaintenance() {
    try {
      const response = await api.post("/admin/maintenance");
      return response.data;
    } catch (error) {
      console.error("Failed to run system maintenance:", error);
      throw error;
    }
  }

  // Driver Management APIs
  static async getAllDrivers(filters: Record<string, unknown> = {}) {
    try {
      const response = await api.get("/drivers", { params: filters });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch drivers:", error);
      throw error;
    }
  }

  static async getDriverById(driverId: string) {
    try {
      const response = await api.get(`/drivers/${driverId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch driver:", error);
      throw error;
    }
  }

  static async createDriver(driverData: CreateDriverData) {
    try {
      const response = await api.post("/drivers", driverData);
      return response.data;
    } catch (error) {
      console.error("Failed to create driver:", error);
      throw error;
    }
  }

  static async updateDriver(driverId: string, driverData: UpdateDriverData) {
    try {
      const response = await api.put(`/drivers/${driverId}`, driverData);
      return response.data;
    } catch (error) {
      console.error("Failed to update driver:", error);
      throw error;
    }
  }

  static async deactivateDriver(driverId: string) {
    try {
      const response = await api.delete(`/drivers/${driverId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to deactivate driver:", error);
      throw error;
    }
  }

  static async getDriverAnalytics() {
    try {
      const response = await api.get("/admin/drivers/analytics");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch driver analytics:", error);
      throw error;
    }
  }

  static async getAvailableUsers() {
    try {
      const response = await api.get("/admin/users/available-drivers");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch available users:", error);
      throw error;
    }
  }
}

// Export individual functions for convenience
export const {
  getSystemOverview,
  getDashboardData,
  getUserAnalytics,
  getFleetAnalytics,
  getSafetyAnalytics,
  getCommunicationAnalytics,
  getPerformanceMetrics,
  getRecentActivities,
  getAllUsers,
  getAllBuses,
  getAllSchools,
  updateUser,
  deactivateUser,
  reactivateUser,
  getSystemSettings,
  updateSystemSettings,
  runSystemMaintenance,
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deactivateDriver,
  getDriverAnalytics,
  getAvailableUsers,
} = AdminApiService;
