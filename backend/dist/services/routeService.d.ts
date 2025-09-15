export interface CreateRouteData {
    name: string;
    description?: string;
    schoolId: string;
    busId?: string;
}
export interface UpdateRouteData {
    name?: string;
    description?: string;
    busId?: string;
    isActive?: boolean;
}
export interface CreateRouteStopData {
    routeId: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    sequence: number;
    pickupTime?: string;
    dropTime?: string;
}
export interface UpdateRouteStopData {
    name?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    sequence?: number;
    pickupTime?: string;
    dropTime?: string;
    isActive?: boolean;
}
export interface RouteFilters {
    schoolId?: string;
    isActive?: boolean;
    hasBus?: boolean;
    search?: string;
}
export interface StudentRouteAssignmentData {
    studentId: string;
    routeId: string;
    stopId: string;
}
export declare class RouteService {
    static createRoute(routeData: CreateRouteData): Promise<any>;
    static getRouteById(routeId: string): Promise<any>;
    static getRoutes(filters?: RouteFilters, page?: number, limit?: number): Promise<{
        routes: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    static updateRoute(routeId: string, updateData: UpdateRouteData): Promise<any>;
    static deleteRoute(routeId: string): Promise<void>;
    static createRouteStop(stopData: CreateRouteStopData): Promise<any>;
    static updateRouteStop(stopId: string, updateData: UpdateRouteStopData): Promise<any>;
    static deleteRouteStop(stopId: string): Promise<void>;
    static assignStudentToRoute(assignmentData: StudentRouteAssignmentData): Promise<any>;
    static unassignStudentFromRoute(studentId: string, routeId: string): Promise<void>;
    static getRouteStats(routeId: string): Promise<{
        totalStops: number;
        totalStudents: number;
        totalTrips: number;
        completedTrips: number;
        averageTripDuration: number;
        routeDistance: number;
    }>;
    static getRoutesBySchool(schoolId: string): Promise<any[]>;
    static getStudentAssignments(studentId: string): Promise<any[]>;
    static reorderRouteStops(routeId: string, stopOrders: {
        stopId: string;
        sequence: number;
    }[]): Promise<any[]>;
}
//# sourceMappingURL=routeService.d.ts.map