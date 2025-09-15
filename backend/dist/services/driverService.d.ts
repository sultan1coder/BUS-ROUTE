export interface CreateDriverData {
    userId: string;
    licenseNumber: string;
    licenseExpiry: Date;
    licenseType: string;
    experienceYears?: number;
    emergencyContact: string;
    emergencyPhone: string;
    medicalInfo?: string;
}
export interface UpdateDriverData {
    licenseNumber?: string;
    licenseExpiry?: Date;
    licenseType?: string;
    experienceYears?: number;
    emergencyContact?: string;
    emergencyPhone?: string;
    medicalInfo?: string;
    isActive?: boolean;
}
export interface DriverFilters {
    isActive?: boolean;
    hasBus?: boolean;
    search?: string;
}
export declare class DriverService {
    static createDriver(driverData: CreateDriverData): Promise<any>;
    static getDriverById(driverId: string): Promise<any>;
    static getDriverByUserId(userId: string): Promise<any>;
    static getDrivers(filters?: DriverFilters, page?: number, limit?: number): Promise<{
        drivers: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    static updateDriver(driverId: string, updateData: UpdateDriverData): Promise<any>;
    static deleteDriver(driverId: string): Promise<void>;
    static assignToBus(driverId: string, busId: string): Promise<any>;
    static unassignFromBus(driverId: string): Promise<any>;
    static getDriverStats(driverId: string): Promise<{
        totalTrips: number;
        completedTrips: number;
        activeTrips: number;
        totalDistance: number;
        totalHours: number;
        averageRating: number;
        totalIncidents: number;
        currentBus?: any;
        recentTrips: any[];
    }>;
    static getAvailableDrivers(): Promise<any[]>;
    static getDriversWithExpiringLicenses(daysAhead?: number): Promise<any[]>;
}
//# sourceMappingURL=driverService.d.ts.map