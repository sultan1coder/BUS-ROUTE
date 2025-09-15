import { Response, NextFunction } from "express";
export declare class DriverController {
    static createDriver: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static getDriverById: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static getMyProfile: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static getDrivers: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static updateDriver: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static updateMyProfile: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static deleteDriver: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static assignToBus: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static unassignFromBus: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static getDriverStats: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static getMyStats: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static getAvailableDrivers: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static getDriversWithExpiringLicenses: (req: import("express").Request, res: Response, next: NextFunction) => void;
}
//# sourceMappingURL=driverController.d.ts.map