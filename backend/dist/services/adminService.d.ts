export interface SystemOverview {
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
export interface UserAnalytics {
    totalUsers: number;
    activeUsers: number;
    usersByRole: {
        role: string;
        count: number;
    }[];
    recentRegistrations: number;
    userGrowth: {
        date: string;
        count: number;
    }[];
    topActiveUsers: any[];
}
export interface FleetAnalytics {
    totalBuses: number;
    activeBuses: number;
    busesByStatus: {
        status: string;
        count: number;
    }[];
    averageBusUtilization: number;
    maintenanceRequired: number;
    fuelEfficiency: number;
    distanceTraveled: number;
}
export interface SafetyAnalytics {
    totalAlerts: number;
    activeAlerts: number;
    alertsByType: {
        type: string;
        count: number;
    }[];
    alertsBySeverity: {
        severity: string;
        count: number;
    }[];
    resolvedToday: number;
    averageResponseTime: number;
    safetyScore: number;
}
export interface CommunicationAnalytics {
    totalMessages: number;
    messagesToday: number;
    unreadMessages: number;
    conversationsByType: {
        type: string;
        count: number;
    }[];
    mostActiveUsers: any[];
    responseRate: number;
}
export interface PerformanceMetrics {
    apiResponseTime: number;
    databaseQueryTime: number;
    cacheHitRate: number;
    errorRate: number;
    throughput: number;
    memoryUsage: number;
}
export interface RevenueAnalytics {
    totalRevenue: number;
    monthlyRevenue: number;
    revenueByService: {
        service: string;
        amount: number;
    }[];
    outstandingPayments: number;
    paymentMethods: {
        method: string;
        count: number;
    }[];
}
export interface DashboardData {
    overview: SystemOverview;
    userAnalytics: UserAnalytics;
    fleetAnalytics: FleetAnalytics;
    safetyAnalytics: SafetyAnalytics;
    communicationAnalytics: CommunicationAnalytics;
    performanceMetrics: PerformanceMetrics;
    recentActivities: any[];
}
export declare class AdminService {
    static getSystemOverview(): Promise<SystemOverview>;
    static getUserAnalytics(dateRange?: {
        start: Date;
        end: Date;
    }): Promise<UserAnalytics>;
    static getFleetAnalytics(dateRange?: {
        start: Date;
        end: Date;
    }): Promise<FleetAnalytics>;
    static getSafetyAnalytics(dateRange?: {
        start: Date;
        end: Date;
    }): Promise<SafetyAnalytics>;
    static getCommunicationAnalytics(dateRange?: {
        start: Date;
        end: Date;
    }): Promise<CommunicationAnalytics>;
    static getPerformanceMetrics(): Promise<PerformanceMetrics>;
    static getDashboardData(filters?: {
        schoolId?: string;
        dateRange?: {
            start: Date;
            end: Date;
        };
    }): Promise<DashboardData>;
    static getRecentActivities(limit?: number): Promise<any[]>;
    static getDetailedReport(reportType: "users" | "fleet" | "safety" | "communication" | "financial", filters?: {
        schoolId?: string;
        dateRange?: {
            start: Date;
            end: Date;
        };
        groupBy?: "day" | "week" | "month";
    }): Promise<any>;
    static exportData(dataType: "users" | "buses" | "students" | "trips" | "alerts", format: "csv" | "json" | "xlsx", filters?: {
        schoolId?: string;
        dateRange?: {
            start: Date;
            end: Date;
        };
    }): Promise<any>;
    static runSystemMaintenance(): Promise<{
        cleanedUsers: number;
        cleanedMessages: number;
        cleanedNotifications: number;
        optimizedDatabase: boolean;
    }>;
    static getSystemSettings(): Promise<any>;
    static updateSystemSettings(settings: any): Promise<any>;
    private static getSystemHealth;
    private static getUserGrowthData;
    private static calculateAverageUtilization;
    private static getFuelEfficiencyData;
    private static getDistanceTraveledData;
    private static calculateAverageResponseTime;
    private static calculateResponseRate;
    private static getUserDetailedReport;
    private static getFleetDetailedReport;
    private static getSafetyDetailedReport;
    private static getCommunicationDetailedReport;
    private static getFinancialDetailedReport;
}
//# sourceMappingURL=adminService.d.ts.map