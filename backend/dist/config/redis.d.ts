import { RedisClientType } from "redis";
export declare const connectRedis: () => Promise<void>;
export declare const getRedisClient: () => RedisClientType | null;
export declare const disconnectRedis: () => Promise<void>;
export declare const setCache: (key: string, value: any, ttl?: number) => Promise<void>;
export declare const getCache: (key: string) => Promise<any>;
export declare const deleteCache: (key: string) => Promise<void>;
export declare const clearCache: (pattern: string) => Promise<void>;
export declare const setSession: (sessionId: string, data: any, ttl?: number) => Promise<void>;
export declare const getSession: (sessionId: string) => Promise<any>;
export declare const deleteSession: (sessionId: string) => Promise<void>;
export declare const setBusLocation: (busId: string, location: any) => Promise<void>;
export declare const getBusLocation: (busId: string) => Promise<any>;
export declare const setBusRoute: (busId: string, routeData: any) => Promise<void>;
export declare const getBusRoute: (busId: string) => Promise<any>;
export declare const pushToList: (key: string, values: any[], maxLength?: number) => Promise<void>;
export declare const getFromList: (key: string, start?: number, end?: number) => Promise<any[]>;
export declare const addToSet: (key: string, members: string[]) => Promise<void>;
export declare const getSetMembers: (key: string) => Promise<string[]>;
export declare const isSetMember: (key: string, member: string) => Promise<boolean>;
export declare const addToSortedSet: (key: string, members: {
    value: string;
    score: number;
}[]) => Promise<void>;
export declare const getSortedSetRange: (key: string, min: number, max: number, withScores?: boolean) => Promise<any[]>;
export declare const incrementCounter: (key: string, increment?: number) => Promise<number>;
export declare const getCounter: (key: string) => Promise<number>;
export declare const publishMessage: (channel: string, message: any) => Promise<void>;
export declare const getTTL: (key: string) => Promise<number>;
export declare const setTTL: (key: string, ttl: number) => Promise<boolean>;
export declare const checkRedisHealth: () => Promise<{
    connected: boolean;
    ping?: number;
    error?: string;
}>;
export declare const executeBatch: (operations: any[]) => Promise<any[]>;
//# sourceMappingURL=redis.d.ts.map