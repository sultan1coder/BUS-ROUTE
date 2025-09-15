export interface ETACalculation {
    busId: string;
    nextStopId?: string;
    currentLocation: {
        latitude: number;
        longitude: number;
    };
    estimatedArrival?: Date;
    distanceToStop?: number;
    estimatedDuration?: number;
    averageSpeed?: number;
    trafficFactor?: number;
}
export interface SpeedViolation {
    busId: string;
    driverId?: string;
    currentSpeed: number;
    speedLimit: number;
    location: {
        latitude: number;
        longitude: number;
    };
    timestamp: Date;
    severity: string;
}
export interface ETAAnalysis {
    busId: string;
    routeId: string;
    scheduledArrival: Date;
    estimatedArrival: Date;
    delayMinutes: number;
    isDelayed: boolean;
    nextStop: {
        id: string;
        name: string;
        latitude: number;
        longitude: number;
    };
    recommendations?: string[];
}
export interface SpeedAnalytics {
    busId: string;
    period: {
        start: Date;
        end: Date;
    };
    averageSpeed: number;
    maxSpeed: number;
    minSpeed: number;
    speedViolations: number;
    totalDistance: number;
    violations: SpeedViolation[];
}
export declare class ETASpeedService {
    private static readonly DEFAULT_SPEED_LIMIT;
    private static readonly WARNING_THRESHOLD;
    private static readonly VIOLATION_THRESHOLD;
    private static readonly CRITICAL_THRESHOLD;
    static calculateETA(busId: string): Promise<ETACalculation>;
    static monitorSpeed(busId: string, currentSpeed: number, location: {
        latitude: number;
        longitude: number;
    }): Promise<SpeedViolation | null>;
    static analyzeETA(busId: string): Promise<ETAAnalysis | null>;
    static getSpeedAnalytics(busId: string, startDate?: Date, endDate?: Date): Promise<SpeedAnalytics>;
    static getFleetSpeedStats(schoolId?: string): Promise<{
        totalBuses: number;
        averageFleetSpeed: number;
        totalViolations: number;
        criticalViolations: number;
        mostViolationsBus?: string;
    }>;
    static predictETA(busId: string, targetStopId: string): Promise<{
        predictedArrival: Date;
        confidence: number;
        basedOnTrips: number;
        averageDelay: number;
    }>;
    private static calculateDistance;
    private static toRadians;
    private static getAverageSpeed;
    private static getTrafficFactor;
}
//# sourceMappingURL=etaSpeedService.d.ts.map