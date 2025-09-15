import { Response } from "express";
export declare class SafetyController {
    static triggerSOS: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static createGeofence: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getBusGeofences: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static updateGeofence: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static deleteGeofence: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static checkGeofenceViolation: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static reportSpeedViolation: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getActiveAlerts: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static resolveAlert: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getSafetyReport: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getAlertHistory: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getEmergencyContacts: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static sendEmergencySMS: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getSafetyStatus: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static bulkResolveAlerts: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getGeofenceStats: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getSpeedViolationStats: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static cleanupAlerts: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=safetyController.d.ts.map