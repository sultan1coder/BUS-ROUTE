export interface SOSAlertData {
    busId?: string;
    driverId?: string;
    type: "SOS" | "ACCIDENT" | "BREAKDOWN" | "MEDICAL_EMERGENCY" | "THEFT" | "OTHER";
    description: string;
    location?: {
        latitude: number;
        longitude: number;
        address?: string;
    };
    severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}
export interface GeofenceData {
    busId: string;
    name: string;
    latitude: number;
    longitude: number;
    radius: number;
    alertOnEnter?: boolean;
    alertOnExit?: boolean;
}
export interface SpeedAlertData {
    busId: string;
    currentSpeed: number;
    speedLimit: number;
    location?: {
        latitude: number;
        longitude: number;
        address?: string;
    };
}
export interface SafetyReport {
    totalAlerts: number;
    activeAlerts: number;
    resolvedAlerts: number;
    alertsByType: {
        type: string;
        count: number;
    }[];
    alertsBySeverity: {
        severity: string;
        count: number;
    }[];
    recentAlerts: any[];
    geofenceViolations: number;
    speedViolations: number;
}
export interface EmergencyContact {
    id: string;
    name: string;
    phone: string;
    relationship: string;
    isPrimary: boolean;
}
export declare class SafetyService {
    static triggerSOSAlert(userId: string, alertData: SOSAlertData): Promise<any>;
    static createGeofence(geofenceData: GeofenceData): Promise<any>;
    static checkGeofenceViolation(busId: string, latitude: number, longitude: number): Promise<{
        violated: boolean;
        geofence?: any;
        action?: "ENTER" | "EXIT";
    }>;
    static handleGeofenceViolation(busId: string, geofence: any, action: "ENTER" | "EXIT", location: {
        latitude: number;
        longitude: number;
    }): Promise<void>;
    static monitorSpeedViolation(speedData: SpeedAlertData): Promise<void>;
    static resolveAlert(alertId: string, resolvedBy: string, resolutionNotes?: string): Promise<any>;
    static getActiveAlerts(filters?: {
        busId?: string;
        driverId?: string;
        type?: string;
        severity?: string;
    }): Promise<any[]>;
    static getBusGeofences(busId: string): Promise<any[]>;
    static updateGeofence(geofenceId: string, updates: Partial<GeofenceData>): Promise<any>;
    static deleteGeofence(geofenceId: string): Promise<boolean>;
    static getSafetyReport(schoolId?: string, dateRange?: {
        start: Date;
        end: Date;
    }): Promise<SafetyReport>;
    static getEmergencyContacts(userId: string): Promise<EmergencyContact[]>;
    static sendEmergencySMS(phoneNumber: string, message: string): Promise<boolean>;
    private static logEmergencyEvent;
    private static sendEmergencyNotifications;
    private static emitRealtimeAlert;
    private static calculateDistance;
    private static verifyUserAccess;
    static cleanupOldAlerts(daysToKeep?: number): Promise<number>;
    static getAlertHistory(filters?: {
        busId?: string;
        driverId?: string;
        type?: string;
        resolved?: boolean;
        startDate?: Date;
        endDate?: Date;
    }, page?: number, limit?: number): Promise<{
        alerts: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
//# sourceMappingURL=safetyService.d.ts.map