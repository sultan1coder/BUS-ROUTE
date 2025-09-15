import { Response, NextFunction } from "express";
export declare class RouteController {
    static createRoute: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static getRouteById: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static getRoutes: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static updateRoute: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static deleteRoute: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static createRouteStop: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static updateRouteStop: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static deleteRouteStop: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static assignStudentToRoute: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static unassignStudentFromRoute: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static getRouteStats: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static getRoutesBySchool: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static getStudentAssignments: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static reorderRouteStops: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static getRouteStops: (req: import("express").Request, res: Response, next: NextFunction) => void;
    static getRouteAssignments: (req: import("express").Request, res: Response, next: NextFunction) => void;
}
//# sourceMappingURL=routeController.d.ts.map