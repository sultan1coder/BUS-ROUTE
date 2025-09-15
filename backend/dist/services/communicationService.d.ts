export interface SendMessageData {
    receiverId: string;
    type: "TEXT" | "IMAGE" | "EMERGENCY";
    content: string;
    attachment?: string;
}
export interface ConversationData {
    participantId: string;
    page?: number;
    limit?: number;
}
export interface MessageThread {
    id: string;
    participants: {
        id: string;
        firstName: string;
        lastName: string;
        role: string;
        avatar?: string | null;
    }[];
    lastMessage: {
        id: string;
        content: string;
        type: string;
        sentAt: Date;
        senderId: string;
    };
    unreadCount: number;
    updatedAt: Date;
}
export interface BulkMessageData {
    receiverIds: string[];
    type: "TEXT" | "IMAGE" | "EMERGENCY";
    content: string;
    attachment?: string;
}
export declare class CommunicationService {
    static sendMessage(senderId: string, messageData: SendMessageData): Promise<any>;
    static sendBulkMessages(senderId: string, bulkData: BulkMessageData): Promise<any[]>;
    static getConversation(userId: string, otherUserId: string, page?: number, limit?: number): Promise<{
        messages: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    static getUserConversations(userId: string, page?: number, limit?: number): Promise<{
        conversations: MessageThread[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    static markMessagesAsRead(userId: string, otherUserId: string): Promise<number>;
    static markMessageAsRead(messageId: string, userId: string): Promise<boolean>;
    static getMessageStats(userId: string): Promise<{
        totalMessages: number;
        unreadMessages: number;
        conversationsCount: number;
        recentActivity: any[];
    }>;
    private static sendEmergencyAlert;
    static getAllowedContacts(userId: string): Promise<any[]>;
    private static getParentContacts;
    private static getDriverContacts;
    private static getAllContacts;
    static deleteMessage(messageId: string, userId: string): Promise<boolean>;
    static searchMessages(userId: string, query: string, page?: number, limit?: number): Promise<{
        messages: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    private static getUserSocketRooms;
    static cleanupOldMessages(daysToKeep?: number): Promise<number>;
}
//# sourceMappingURL=communicationService.d.ts.map