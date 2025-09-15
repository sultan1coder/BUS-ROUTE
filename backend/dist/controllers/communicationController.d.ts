import { Response } from "express";
export declare class CommunicationController {
    static sendMessage: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getConversation: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getConversations: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static markAsRead: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static markMessageAsRead: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getContacts: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getMessageStats: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static sendBulkMessages: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static deleteMessage: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static searchMessages: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getEmergencyContacts: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static sendEmergencyMessage: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getUnreadCount: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static cleanupMessages: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=communicationController.d.ts.map