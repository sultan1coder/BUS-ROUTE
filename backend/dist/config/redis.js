"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeBatch = exports.checkRedisHealth = exports.setTTL = exports.getTTL = exports.publishMessage = exports.getCounter = exports.incrementCounter = exports.getSortedSetRange = exports.addToSortedSet = exports.isSetMember = exports.getSetMembers = exports.addToSet = exports.getFromList = exports.pushToList = exports.getBusRoute = exports.setBusRoute = exports.getBusLocation = exports.setBusLocation = exports.deleteSession = exports.getSession = exports.setSession = exports.clearCache = exports.deleteCache = exports.getCache = exports.setCache = exports.disconnectRedis = exports.getRedisClient = exports.connectRedis = void 0;
const redis_1 = require("redis");
let redisClient;
let isConnecting = false;
const connectRedis = async () => {
    // Prevent concurrent connection attempts
    if (isConnecting) {
        console.log("🔄 Redis connection already in progress, waiting...");
        return;
    }
    // If already connected, skip
    if (redisClient && redisClient.isOpen) {
        console.log("✅ Redis already connected");
        return;
    }
    isConnecting = true;
    try {
        // Clean up any existing client
        if (redisClient) {
            try {
                await redisClient.disconnect();
            }
            catch (e) {
                // Ignore cleanup errors
            }
            redisClient = null;
        }
        console.log("🔌 Attempting to connect to Redis...");
        redisClient = (0, redis_1.createClient)({
            url: process.env.REDIS_URL || "redis://localhost:6379",
        });
        // Remove any existing error listeners to prevent duplicates
        redisClient.removeAllListeners("error");
        redisClient.removeAllListeners("connect");
        redisClient.on("error", (err) => {
            // Suppress individual error logs - handled by connectRedis function
            console.debug("Redis client error:", err.message);
        });
        redisClient.on("connect", () => {
            console.log("✅ Redis connected successfully");
        });
        await redisClient.connect();
        console.log("🎉 Redis connection established");
    }
    catch (error) {
        console.warn("⚠️  Redis connection failed (continuing without Redis):", error instanceof Error ? error.message : String(error));
        console.log("ℹ️  Application will run without Redis caching features");
        redisClient = null; // Allow app to continue without Redis
    }
    finally {
        isConnecting = false;
    }
};
exports.connectRedis = connectRedis;
const getRedisClient = () => {
    return redisClient;
};
exports.getRedisClient = getRedisClient;
const disconnectRedis = async () => {
    try {
        if (redisClient) {
            await redisClient.disconnect();
            console.log("✅ Redis disconnected successfully");
        }
    }
    catch (error) {
        console.error("❌ Redis disconnection failed:", error);
    }
};
exports.disconnectRedis = disconnectRedis;
// Cache operations
const setCache = async (key, value, ttl) => {
    if (!redisClient)
        return; // Skip if Redis not available
    try {
        const serializedValue = JSON.stringify(value);
        if (ttl) {
            await redisClient.setEx(key, ttl, serializedValue);
        }
        else {
            await redisClient.set(key, serializedValue);
        }
    }
    catch (error) {
        console.warn("Cache set error (non-critical):", error instanceof Error ? error.message : String(error));
    }
};
exports.setCache = setCache;
const getCache = async (key) => {
    if (!redisClient)
        return null; // Return null if Redis not available
    try {
        const value = await redisClient.get(key);
        return value ? JSON.parse(value) : null;
    }
    catch (error) {
        console.warn("Cache get error (non-critical):", error instanceof Error ? error.message : String(error));
        return null;
    }
};
exports.getCache = getCache;
const deleteCache = async (key) => {
    if (!redisClient)
        return; // Skip if Redis not available
    try {
        await redisClient.del(key);
    }
    catch (error) {
        console.warn("Cache delete error (non-critical):", error instanceof Error ? error.message : String(error));
    }
};
exports.deleteCache = deleteCache;
const clearCache = async (pattern) => {
    if (!redisClient)
        return; // Skip if Redis not available
    try {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
            await redisClient.del(keys);
        }
    }
    catch (error) {
        console.warn("Cache clear error (non-critical):", error instanceof Error ? error.message : String(error));
    }
};
exports.clearCache = clearCache;
// Session management
const setSession = async (sessionId, data, ttl = 86400) => {
    await (0, exports.setCache)(`session:${sessionId}`, data, ttl);
};
exports.setSession = setSession;
const getSession = async (sessionId) => {
    return await (0, exports.getCache)(`session:${sessionId}`);
};
exports.getSession = getSession;
const deleteSession = async (sessionId) => {
    await (0, exports.deleteCache)(`session:${sessionId}`);
};
exports.deleteSession = deleteSession;
// Real-time tracking cache
const setBusLocation = async (busId, location) => {
    await (0, exports.setCache)(`bus:location:${busId}`, location, 300); // 5 minutes TTL
};
exports.setBusLocation = setBusLocation;
const getBusLocation = async (busId) => {
    return await (0, exports.getCache)(`bus:location:${busId}`);
};
exports.getBusLocation = getBusLocation;
const setBusRoute = async (busId, routeData) => {
    await (0, exports.setCache)(`bus:route:${busId}`, routeData, 3600); // 1 hour TTL
};
exports.setBusRoute = setBusRoute;
const getBusRoute = async (busId) => {
    return await (0, exports.getCache)(`bus:route:${busId}`);
};
exports.getBusRoute = getBusRoute;
// Additional Redis operations missing from the file:
// List operations
const pushToList = async (key, values, maxLength) => {
    if (!redisClient)
        return;
    try {
        await redisClient.lPush(key, values.map((v) => JSON.stringify(v)));
        if (maxLength) {
            await redisClient.lTrim(key, 0, maxLength - 1);
        }
    }
    catch (error) {
        console.warn("List push error (non-critical):", error instanceof Error ? error.message : String(error));
    }
};
exports.pushToList = pushToList;
const getFromList = async (key, start = 0, end = -1) => {
    if (!redisClient)
        return [];
    try {
        const values = await redisClient.lRange(key, start, end);
        return values.map((v) => JSON.parse(v)).reverse(); // Reverse to get chronological order
    }
    catch (error) {
        console.warn("List get error (non-critical):", error instanceof Error ? error.message : String(error));
        return [];
    }
};
exports.getFromList = getFromList;
// Set operations
const addToSet = async (key, members) => {
    if (!redisClient)
        return;
    try {
        await redisClient.sAdd(key, members);
    }
    catch (error) {
        console.warn("Set add error (non-critical):", error instanceof Error ? error.message : String(error));
    }
};
exports.addToSet = addToSet;
const getSetMembers = async (key) => {
    if (!redisClient)
        return [];
    try {
        return await redisClient.sMembers(key);
    }
    catch (error) {
        console.warn("Set members error (non-critical):", error instanceof Error ? error.message : String(error));
        return [];
    }
};
exports.getSetMembers = getSetMembers;
const isSetMember = async (key, member) => {
    if (!redisClient)
        return false;
    try {
        const result = await redisClient.sIsMember(key, member);
        return result === 1;
    }
    catch (error) {
        console.warn("Set member check error (non-critical):", error instanceof Error ? error.message : String(error));
        return false;
    }
};
exports.isSetMember = isSetMember;
// Sorted set operations
const addToSortedSet = async (key, members) => {
    if (!redisClient)
        return;
    try {
        await redisClient.zAdd(key, members);
    }
    catch (error) {
        console.warn("Sorted set add error (non-critical):", error instanceof Error ? error.message : String(error));
    }
};
exports.addToSortedSet = addToSortedSet;
const getSortedSetRange = async (key, min, max, withScores = false) => {
    if (!redisClient)
        return [];
    try {
        const result = await redisClient.zRangeWithScores(key, min, max);
        return withScores ? result : result.map((item) => item.value);
    }
    catch (error) {
        console.warn("Sorted set range error (non-critical):", error instanceof Error ? error.message : String(error));
        return [];
    }
};
exports.getSortedSetRange = getSortedSetRange;
// Atomic counters
const incrementCounter = async (key, increment = 1) => {
    if (!redisClient)
        return 0;
    try {
        return await redisClient.incrBy(key, increment);
    }
    catch (error) {
        console.warn("Counter increment error (non-critical):", error instanceof Error ? error.message : String(error));
        return 0;
    }
};
exports.incrementCounter = incrementCounter;
const getCounter = async (key) => {
    if (!redisClient)
        return 0;
    try {
        const value = await redisClient.get(key);
        return value ? parseInt(value, 10) : 0;
    }
    catch (error) {
        console.warn("Counter get error (non-critical):", error instanceof Error ? error.message : String(error));
        return 0;
    }
};
exports.getCounter = getCounter;
// Pub/Sub operations
const publishMessage = async (channel, message) => {
    if (!redisClient)
        return;
    try {
        await redisClient.publish(channel, JSON.stringify(message));
    }
    catch (error) {
        console.warn("Publish error (non-critical):", error instanceof Error ? error.message : String(error));
    }
};
exports.publishMessage = publishMessage;
// TTL operations
const getTTL = async (key) => {
    if (!redisClient)
        return -1;
    try {
        return await redisClient.ttl(key);
    }
    catch (error) {
        console.warn("TTL check error (non-critical):", error instanceof Error ? error.message : String(error));
        return -1;
    }
};
exports.getTTL = getTTL;
const setTTL = async (key, ttl) => {
    if (!redisClient)
        return false;
    try {
        const result = await redisClient.expire(key, ttl);
        return result === 1;
    }
    catch (error) {
        console.warn("TTL set error (non-critical):", error instanceof Error ? error.message : String(error));
        return false;
    }
};
exports.setTTL = setTTL;
// Health check
const checkRedisHealth = async () => {
    if (!redisClient) {
        return { connected: false, error: "Redis client not initialized" };
    }
    try {
        const start = Date.now();
        await redisClient.ping();
        const ping = Date.now() - start;
        return { connected: true, ping };
    }
    catch (error) {
        return {
            connected: false,
            error: error instanceof Error ? error.message : String(error),
        };
    }
};
exports.checkRedisHealth = checkRedisHealth;
// Batch operations
const executeBatch = async (operations) => {
    if (!redisClient)
        return [];
    try {
        const results = [];
        for (const op of operations) {
            if (op.type === "set") {
                results.push(await (0, exports.setCache)(op.key, op.value, op.ttl));
            }
            else if (op.type === "get") {
                results.push(await (0, exports.getCache)(op.key));
            }
            else if (op.type === "del") {
                results.push(await (0, exports.deleteCache)(op.key));
            }
        }
        return results;
    }
    catch (error) {
        console.warn("Batch execution error (non-critical):", error instanceof Error ? error.message : String(error));
        return [];
    }
};
exports.executeBatch = executeBatch;
//# sourceMappingURL=redis.js.map