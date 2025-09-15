export interface TripStartData {
    routeId: string;
    scheduledStartTime?: Date;
    notes?: string;
}
export interface TripUpdate {
    status?: "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "DELAYED";
    currentLocation?: {
        latitude: number;
        longitude: number;
    };
    notes?: string;
}
export interface StudentPickupData {
    studentId: string;
    stopId: string;
    pickupTime?: Date;
    location?: {
        latitude: number;
        longitude: number;
    };
}
export interface StudentDropData {
    studentId: string;
    stopId: string;
    dropTime?: Date;
    location?: {
        latitude: number;
        longitude: number;
    };
}
export interface NavigationData {
    routeId: string;
    currentLocation?: {
        latitude: number;
        longitude: number;
    };
}
export interface DriverStatus {
    isOnline: boolean;
    currentTripId?: string;
    currentLocation?: {
        latitude: number;
        longitude: number;
        timestamp: Date;
    };
    status: "AVAILABLE" | "ON_TRIP" | "BREAK" | "OFFLINE";
    lastUpdated: Date;
}
export interface TripSummary {
    tripId: string;
    routeId: string;
    busId: string;
    startTime: Date;
    endTime?: Date;
    duration?: number;
    totalStudents: number;
    pickedUpStudents: number;
    droppedOffStudents: number;
    status: string;
    distanceTraveled?: number;
    averageSpeed?: number;
    issues?: string[];
}
export interface DriverDashboard {
    driverInfo: any;
    currentTrip?: any;
    todaysTrips: any[];
    upcomingTrips: any[];
    recentActivity: any[];
    statistics: {
        totalTripsToday: number;
        totalStudentsTransported: number;
        totalDistance: number;
        averageRating?: number;
        onTimePerformance: number;
    };
}
export declare class DriverAppService {
    static startTrip(driverId: string, tripData: TripStartData): Promise<any>;
    static updateTrip(driverId: string, tripId: string, updateData: TripUpdate): Promise<any>;
    static getCurrentTrip(driverId: string): Promise<any>;
    static getTripNavigation(driverId: string, navigationData: NavigationData): Promise<any>;
    static recordStudentPickup(driverId: string, tripId: string, pickupData: StudentPickupData): Promise<any>;
    static recordStudentDrop(driverId: string, tripId: string, dropData: StudentDropData): Promise<any>;
    static getStudentManifest(driverId: string, tripId: string): Promise<any>;
    static updateDriverLocation(driverId: string, location: {
        latitude: number;
        longitude: number;
    }, additionalData?: {
        speed?: number;
        heading?: number;
        accuracy?: number;
    }): Promise<void>;
    static getDriverDashboard(driverId: string): Promise<DriverDashboard>;
    static getDriverTripHistory(driverId: string, page?: number, limit?: number, filters?: {
        startDate?: Date;
        endDate?: Date;
        status?: string;
    }): Promise<{
        trips: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    static triggerDriverEmergency(driverId: string, emergencyData: {
        type: "SOS" | "ACCIDENT" | "BREAKDOWN" | "MEDICAL_EMERGENCY" | "OTHER";
        description: string;
        location?: {
            latitude: number;
            longitude: number;
        };
    }): Promise<any>;
    static getDriverReport(driverId: string, period?: "daily" | "weekly" | "monthly"): Promise<any>;
    static updateDriverStatus(driverId: string, status: Partial<DriverStatus>): Promise<void>;
    static getDriverRoutes(driverId: string): Promise<any[]>;
    private static getDriverRecentActivity;
    private static getDriverTripStats;
    private static calculateNextStop;
    private static calculateTripProgress;
    private static calculateDistance;
    private static emitTripEvent;
    private static emitDriverEvent;
}
//# sourceMappingURL=driverAppService.d.ts.map