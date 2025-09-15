import { Response } from "express";
export declare class NotificationController {
    static getUserNotifications: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static markAsRead: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static markAllAsRead: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getPreferences: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static updatePreferences: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static sendTestNotification: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getNotificationStats: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static cleanupOldNotifications: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static bulkSendNotifications: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getBusNotifications: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=notificationController.d.ts.map