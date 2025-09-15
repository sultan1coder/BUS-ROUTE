import { UserRole } from "../types";
export interface RegisterUserData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phone?: string;
}
export interface LoginData {
    email: string;
    password: string;
}
export interface AuthResponse {
    user: any;
    accessToken: string;
    refreshToken: string;
}
export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
}
export declare class AuthService {
    static register(userData: RegisterUserData): Promise<AuthResponse>;
    static login(loginData: LoginData): Promise<AuthResponse>;
    static refreshToken(refreshToken: string): Promise<TokenResponse>;
    static changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
    static getProfile(userId: string): Promise<any>;
    static updateProfile(userId: string, updateData: any): Promise<any>;
    static deactivateAccount(userId: string): Promise<void>;
    static validateUser(userId: string): Promise<any>;
}
//# sourceMappingURL=authService.d.ts.map