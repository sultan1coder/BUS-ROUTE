import { Response, NextFunction } from "express";
export declare class BusController {
    static createBus: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static getBusById: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static getBuses: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static updateBus: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static deleteBus: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static assignDriver: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static unassignDriver: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static getBusStats: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static getBusesBySchool: (req: import("express").Request, res: Response, next: NextFunction) => void;
}
//# sourceMappingURL=busController.d.ts.map