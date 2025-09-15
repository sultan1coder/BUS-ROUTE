export interface GPSData {
    busId: string;
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
    accuracy?: number;
    altitude?: number;
    timestamp?: Date;
    tripId?: string;
}
export interface LocationHistoryFilters {
    busId?: string;
    startDate?: Date;
    endDate?: Date;
    tripId?: string;
}
export interface SpeedAnalysis {
    averageSpeed: number;
    maxSpeed: number;
    minSpeed: number;
    speedViolations: number;
    totalDistance: number;
}
export interface RouteDeviation {
    isOnRoute: boolean;
    deviationDistance: number;
    nearestStop?: any;
    estimatedArrival?: Date;
}
export declare class GPSTrackingService {
    static recordLocation(gpsData: GPSData): Promise<any>;
    static getCurrentLocation(busId: string): Promise<any>;
    static getLocationHistory(filters: LocationHistoryFilters, page?: number, limit?: number): Promise<{
        locations: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    static getMultipleBusLocations(busIds: string[]): Promise<any[]>;
    static analyzeSpeed(busId: string, startDate?: Date, endDate?: Date): Promise<SpeedAnalysis>;
    static checkGeofenceStatus(busId: string): Promise<{
        inGeofence: boolean;
        geofence?: any;
        distance?: number;
    }>;
    private static calculateDistance;
    private static toRadians;
    static cleanupOldData(daysToKeep?: number): Promise<number>;
    static getBusRoute(busId: string): Promise<any>;
    static calculateETA(busId: string): Promise<{
        nextStop?: any;
        eta?: Date;
        distance?: number;
        estimatedDuration?: number;
    }>;
    static getTrackingStats(busId: string, days?: number): Promise<{
        totalRecords: number;
        averageSpeed: number;
        totalDistance: number;
        lastUpdate?: Date;
        isActive: boolean;
    }>;
}
//# sourceMappingURL=gpsTrackingService.d.ts.map