import { createClient, RedisClientType } from "redis";

let redisClient: RedisClientType;
let isConnecting = false;

export const connectRedis = async (): Promise<void> => {
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
      } catch (e) {
        // Ignore cleanup errors
      }
      redisClient = null as any;
    }

    console.log("🔌 Attempting to connect to Redis...");
    redisClient = createClient({
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
  } catch (error) {
    console.warn(
      "⚠️  Redis connection failed (continuing without Redis):",
      error instanceof Error ? error.message : String(error)
    );
    console.log("ℹ️  Application will run without Redis caching features");
    redisClient = null as any; // Allow app to continue without Redis
  } finally {
    isConnecting = false;
  }
};

export const getRedisClient = (): RedisClientType | null => {
  return redisClient;
};

export const disconnectRedis = async (): Promise<void> => {
  try {
    if (redisClient) {
      await redisClient.disconnect();
      console.log("✅ Redis disconnected successfully");
    }
  } catch (error) {
    console.error("❌ Redis disconnection failed:", error);
  }
};

// Cache operations
export const setCache = async (
  key: string,
  value: any,
  ttl?: number
): Promise<void> => {
  if (!redisClient) return; // Skip if Redis not available

  try {
    const serializedValue = JSON.stringify(value);
    if (ttl) {
      await redisClient.setEx(key, ttl, serializedValue);
    } else {
      await redisClient.set(key, serializedValue);
    }
  } catch (error) {
    console.warn(
      "Cache set error (non-critical):",
      error instanceof Error ? error.message : String(error)
    );
  }
};

export const getCache = async (key: string): Promise<any> => {
  if (!redisClient) return null; // Return null if Redis not available

  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.warn(
      "Cache get error (non-critical):",
      error instanceof Error ? error.message : String(error)
    );
    return null;
  }
};

export const deleteCache = async (key: string): Promise<void> => {
  if (!redisClient) return; // Skip if Redis not available

  try {
    await redisClient.del(key);
  } catch (error) {
    console.warn(
      "Cache delete error (non-critical):",
      error instanceof Error ? error.message : String(error)
    );
  }
};

export const clearCache = async (pattern: string): Promise<void> => {
  if (!redisClient) return; // Skip if Redis not available

  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.warn(
      "Cache clear error (non-critical):",
      error instanceof Error ? error.message : String(error)
    );
  }
};

// Session management
export const setSession = async (
  sessionId: string,
  data: any,
  ttl: number = 86400
): Promise<void> => {
  await setCache(`session:${sessionId}`, data, ttl);
};

export const getSession = async (sessionId: string): Promise<any> => {
  return await getCache(`session:${sessionId}`);
};

export const deleteSession = async (sessionId: string): Promise<void> => {
  await deleteCache(`session:${sessionId}`);
};

// Real-time tracking cache
export const setBusLocation = async (
  busId: string,
  location: any
): Promise<void> => {
  await setCache(`bus:location:${busId}`, location, 300); // 5 minutes TTL
};

export const getBusLocation = async (busId: string): Promise<any> => {
  return await getCache(`bus:location:${busId}`);
};

export const setBusRoute = async (
  busId: string,
  routeData: any
): Promise<void> => {
  await setCache(`bus:route:${busId}`, routeData, 3600); // 1 hour TTL
};

export const getBusRoute = async (busId: string): Promise<any> => {
  return await getCache(`bus:route:${busId}`);
};

// Additional Redis operations missing from the file:

// List operations
export const pushToList = async (
  key: string,
  values: any[],
  maxLength?: number
): Promise<void> => {
  if (!redisClient) return;

  try {
    await redisClient.lPush(
      key,
      values.map((v) => JSON.stringify(v))
    );
    if (maxLength) {
      await redisClient.lTrim(key, 0, maxLength - 1);
    }
  } catch (error) {
    console.warn(
      "List push error (non-critical):",
      error instanceof Error ? error.message : String(error)
    );
  }
};

export const getFromList = async (
  key: string,
  start: number = 0,
  end: number = -1
): Promise<any[]> => {
  if (!redisClient) return [];

  try {
    const values = await redisClient.lRange(key, start, end);
    return values.map((v) => JSON.parse(v)).reverse(); // Reverse to get chronological order
  } catch (error) {
    console.warn(
      "List get error (non-critical):",
      error instanceof Error ? error.message : String(error)
    );
    return [];
  }
};

// Set operations
export const addToSet = async (
  key: string,
  members: string[]
): Promise<void> => {
  if (!redisClient) return;

  try {
    await redisClient.sAdd(key, members);
  } catch (error) {
    console.warn(
      "Set add error (non-critical):",
      error instanceof Error ? error.message : String(error)
    );
  }
};

export const getSetMembers = async (key: string): Promise<string[]> => {
  if (!redisClient) return [];

  try {
    return await redisClient.sMembers(key);
  } catch (error) {
    console.warn(
      "Set members error (non-critical):",
      error instanceof Error ? error.message : String(error)
    );
    return [];
  }
};

export const isSetMember = async (
  key: string,
  member: string
): Promise<boolean> => {
  if (!redisClient) return false;

  try {
    const result = await redisClient.sIsMember(key, member);
    return result === 1;
  } catch (error) {
    console.warn(
      "Set member check error (non-critical):",
      error instanceof Error ? error.message : String(error)
    );
    return false;
  }
};

// Sorted set operations
export const addToSortedSet = async (
  key: string,
  members: { value: string; score: number }[]
): Promise<void> => {
  if (!redisClient) return;

  try {
    await redisClient.zAdd(key, members);
  } catch (error) {
    console.warn(
      "Sorted set add error (non-critical):",
      error instanceof Error ? error.message : String(error)
    );
  }
};

export const getSortedSetRange = async (
  key: string,
  min: number,
  max: number,
  withScores: boolean = false
): Promise<any[]> => {
  if (!redisClient) return [];

  try {
    const result = await redisClient.zRangeWithScores(key, min, max);
    return withScores ? result : result.map((item) => item.value);
  } catch (error) {
    console.warn(
      "Sorted set range error (non-critical):",
      error instanceof Error ? error.message : String(error)
    );
    return [];
  }
};

// Atomic counters
export const incrementCounter = async (
  key: string,
  increment: number = 1
): Promise<number> => {
  if (!redisClient) return 0;

  try {
    return await redisClient.incrBy(key, increment);
  } catch (error) {
    console.warn(
      "Counter increment error (non-critical):",
      error instanceof Error ? error.message : String(error)
    );
    return 0;
  }
};

export const getCounter = async (key: string): Promise<number> => {
  if (!redisClient) return 0;

  try {
    const value = await redisClient.get(key);
    return value ? parseInt(value, 10) : 0;
  } catch (error) {
    console.warn(
      "Counter get error (non-critical):",
      error instanceof Error ? error.message : String(error)
    );
    return 0;
  }
};

// Pub/Sub operations
export const publishMessage = async (
  channel: string,
  message: any
): Promise<void> => {
  if (!redisClient) return;

  try {
    await redisClient.publish(channel, JSON.stringify(message));
  } catch (error) {
    console.warn(
      "Publish error (non-critical):",
      error instanceof Error ? error.message : String(error)
    );
  }
};

// TTL operations
export const getTTL = async (key: string): Promise<number> => {
  if (!redisClient) return -1;

  try {
    return await redisClient.ttl(key);
  } catch (error) {
    console.warn(
      "TTL check error (non-critical):",
      error instanceof Error ? error.message : String(error)
    );
    return -1;
  }
};

export const setTTL = async (key: string, ttl: number): Promise<boolean> => {
  if (!redisClient) return false;

  try {
    const result = await redisClient.expire(key, ttl);
    return result === 1;
  } catch (error) {
    console.warn(
      "TTL set error (non-critical):",
      error instanceof Error ? error.message : String(error)
    );
    return false;
  }
};

// Health check
export const checkRedisHealth = async (): Promise<{
  connected: boolean;
  ping?: number;
  error?: string;
}> => {
  if (!redisClient) {
    return { connected: false, error: "Redis client not initialized" };
  }

  try {
    const start = Date.now();
    await redisClient.ping();
    const ping = Date.now() - start;

    return { connected: true, ping };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

// Batch operations
export const executeBatch = async (operations: any[]): Promise<any[]> => {
  if (!redisClient) return [];

  try {
    const results = [];
    for (const op of operations) {
      if (op.type === "set") {
        results.push(await setCache(op.key, op.value, op.ttl));
      } else if (op.type === "get") {
        results.push(await getCache(op.key));
      } else if (op.type === "del") {
        results.push(await deleteCache(op.key));
      }
    }
    return results;
  } catch (error) {
    console.warn(
      "Batch execution error (non-critical):",
      error instanceof Error ? error.message : String(error)
    );
    return [];
  }
};
