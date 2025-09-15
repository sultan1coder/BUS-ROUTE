export interface CreateBusData {
    plateNumber: string;
    capacity: number;
    model: string;
    year: number;
    color: string;
    schoolId: string;
    gpsDeviceId?: string;
}
export interface UpdateBusData {
    plateNumber?: string;
    capacity?: number;
    model?: string;
    year?: number;
    color?: string;
    isActive?: boolean;
    gpsDeviceId?: string;
    lastMaintenance?: Date;
    nextMaintenance?: Date;
}
export interface BusFilters {
    schoolId?: string;
    isActive?: boolean;
    driverId?: string;
    search?: string;
}
export declare class BusService {
    static createBus(busData: CreateBusData): Promise<any>;
    static getBusById(busId: string): Promise<any>;
    static getBuses(filters?: BusFilters, page?: number, limit?: number): Promise<{
        buses: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    static updateBus(busId: string, updateData: UpdateBusData): Promise<any>;
    static deleteBus(busId: string): Promise<void>;
    static assignDriver(busId: string, driverId: string): Promise<any>;
    static unassignDriver(busId: string): Promise<any>;
    static getBusStats(busId: string): Promise<{
        totalTrips: number;
        completedTrips: number;
        activeTrips: number;
        totalDistance: number;
        lastLocation?: any;
        currentDriver?: any;
    }>;
    static getBusesBySchool(schoolId: string): Promise<any[]>;
}
//# sourceMappingURL=busService.d.ts.map