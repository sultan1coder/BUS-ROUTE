import { Response } from "express";
export declare class DriverAppController {
    static getDashboard: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static startTrip: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static updateTrip: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getCurrentTrip: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getTripNavigation: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static recordStudentPickup: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static recordStudentDrop: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getStudentManifest: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static updateLocation: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getRoutes: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getTripHistory: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getReport: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static triggerEmergency: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static updateDriverStatus: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getRouteDetails: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getStopDetails: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getTripSummary: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static quickAttendanceCheck: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getNotifications: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static markNotificationRead: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getDriverSettings: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static updateDriverSettings: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=driverAppController.d.ts.map