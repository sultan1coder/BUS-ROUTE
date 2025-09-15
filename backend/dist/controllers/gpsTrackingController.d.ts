import { Response, NextFunction } from "express";
export declare class GPSTrackingController {
    static recordLocation: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static getCurrentLocation: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static getLocationHistory: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static getMultipleBusLocations: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static analyzeSpeed: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static checkGeofenceStatus: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static calculateETA: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static getTrackingStats: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static getBusRoute: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static cleanupOldData: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static bulkRecordLocations: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static getDashboardData: (req: import("express").Request, res: Response, next: NextFunction) => void;
}
//# sourceMappingURL=gpsTrackingController.d.ts.map