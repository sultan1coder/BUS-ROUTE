import { Response } from "express";
export declare class StudentController {
    static createStudent: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getStudentById: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static updateStudent: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static deleteStudent: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getStudents: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static assignToRoute: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static unassignFromRoute: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static recordRFIDAttendance: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static recordNFCAttendance: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getStudentAttendance: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getAttendanceStats: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getStudentsWithoutTags: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static bulkAssignTags: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getStudentManifest: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static recordManualAttendance: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getAttendanceReport: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=studentController.d.ts.map