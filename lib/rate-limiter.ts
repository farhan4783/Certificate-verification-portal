import Redis from "ioredis";
import logger from "./logger";

let redis: Redis | null = null;

if (process.env.REDIS_URL) {
  try {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      connectTimeout: 5000,
    });
    redis.on("error", (err) => {
      logger.error("Redis connection error in rate limiter:", err);
    });
  } catch (err) {
    logger.error("Failed to initialize Redis client:", err);
  }
} else {
  logger.warn("REDIS_URL is not configured. Rate limiting is falling back to local memory.");
}

// In-memory sliding window fallback (key: IP/Route, value: timestamp[])
const memoryLimits = new Map<string, number[]>();

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  if (redis) {
    try {
      const redisKey = `ratelimit:${key}`;
      const clearBefore = now - windowMs;

      // Sliding window via sorted set transactions
      const multi = redis.multi();
      multi.zremrangebyscore(redisKey, 0, clearBefore);
      multi.zadd(redisKey, now, `${now}-${Math.random()}`);
      multi.zcard(redisKey);
      multi.expire(redisKey, windowSeconds);

      const results = await multi.exec();
      if (results && results[2]) {
        // results[2] is the output of ZCARD (index 2 in multi pipeline)
        const count = results[2][1] as number;
        return {
          success: count <= limit,
          limit,
          remaining: Math.max(0, limit - count),
        };
      }
    } catch (err) {
      logger.error("Redis rate limiting failed, falling back to local memory:", err);
    }
  }

  // Memory Fallback
  const timestamps = memoryLimits.get(key) || [];
  const activeTimestamps = timestamps.filter((ts) => now - ts < windowMs);

  const count = activeTimestamps.length;
  if (count < limit) {
    activeTimestamps.push(now);
    memoryLimits.set(key, activeTimestamps);
    return {
      success: true,
      limit,
      remaining: limit - count - 1,
    };
  }

  return {
    success: false,
    limit,
    remaining: 0,
  };
}
export default checkRateLimit;
