import { Response, NextFunction } from "express";
import { AuthenticatedRequest, UserRole } from "../types";
export declare const authenticate: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const authorize: (...roles: UserRole[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireSchoolStaff: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireDriver: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireDriverOnly: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireParent: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const optionalAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const authorizeSchoolAccess: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map