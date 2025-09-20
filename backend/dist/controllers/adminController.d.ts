import { Response } from "express";
export declare class AdminController {
    static getSystemOverview: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getDashboard: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getUserAnalytics: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getFleetAnalytics: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getSafetyAnalytics: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getCommunicationAnalytics: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getPerformanceMetrics: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getRecentActivities: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getDetailedReport: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static exportData: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static runSystemMaintenance: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getSystemSettings: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static updateSystemSettings: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getAllUsers: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static updateUser: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static deactivateUser: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static reactivateUser: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getAllBuses: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getAllSchools: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getSystemLogs: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    private static convertToCSV;
    static createSchool: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static updateSchool: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static deleteSchool: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getSchoolById: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=adminController.d.ts.map