export interface NotificationData {
    type: any;
    title: string;
    message: string;
    recipientId: string;
    priority: "low" | "medium" | "high" | "critical";
    data?: any;
}
export interface PushNotificationData {
    userId: string;
    title: string;
    body: string;
    data?: any;
    sound?: string;
    badge?: number;
}
export interface NotificationPreferences {
    userId: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    busLocationUpdates: boolean;
    studentPickupAlerts: boolean;
    studentDropAlerts: boolean;
    delayAlerts: boolean;
    emergencyAlerts: boolean;
    speedViolationAlerts: boolean;
    attendanceUpdates: boolean;
    quietHoursStart?: string | null;
    quietHoursEnd?: string | null;
}
export declare class NotificationService {
    static sendNotification(notificationData: NotificationData): Promise<any>;
    static sendBulkNotifications(notifications: NotificationData[], userIds?: string[]): Promise<any[]>;
    static notifyBusLocation(busId: string): Promise<void>;
    static notifyStudentPickup(studentId: string, busId: string, tripId?: string): Promise<void>;
    static notifyStudentDrop(studentId: string, busId: string, tripId?: string): Promise<void>;
    static notifyBusDelay(busId: string, delayMinutes: number, reason?: string): Promise<void>;
    static notifyEmergency(busId: string, emergencyType: string, description: string, location?: {
        latitude: number;
        longitude: number;
    }): Promise<void>;
    static notifySpeedViolation(busId: string, speed: number, speedLimit: number, severity: string, driverId?: string): Promise<void>;
    static getUserNotificationPreferences(userId: string): Promise<NotificationPreferences | null>;
    static updateNotificationPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences>;
    static getUserNotifications(userId: string, page?: number, limit?: number, unreadOnly?: boolean): Promise<{
        notifications: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        unreadCount: number;
    }>;
    static markNotificationAsRead(notificationId: string, userId: string): Promise<boolean>;
    static markAllNotificationsAsRead(userId: string): Promise<number>;
    private static sendPushNotification;
    private static getUserSocketRooms;
    private static formatLocation;
    private static formatTime;
    static cleanupOldNotifications(daysToKeep?: number): Promise<number>;
}
//# sourceMappingURL=notificationService.d.ts.map