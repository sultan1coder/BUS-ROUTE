import { Response } from "express";
export declare class ETASpeedController {
    static calculateETA: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static monitorSpeed: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static analyzeETA: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getSpeedAnalytics: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getFleetSpeedStats: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static predictETA: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getSpeedViolations: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getETAAllerts: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static bulkSpeedMonitoring: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getSpeedViolationStats: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=etaSpeedController.d.ts.map