import { UserRole } from "../types";
interface JWTPayload {
    id: string;
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string;
}
export declare const generateToken: (payload: JWTPayload) => string;
export declare const verifyToken: (token: string) => JWTPayload;
export declare const extractTokenFromHeader: (authHeader: string | undefined) => string | null;
export declare const generateRefreshToken: (payload: {
    id: string;
}) => string;
export declare const verifyRefreshToken: (token: string) => {
    id: string;
};
export {};
//# sourceMappingURL=jwt.d.ts.map