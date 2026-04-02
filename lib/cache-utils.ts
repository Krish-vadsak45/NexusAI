import mongoose from "mongoose";
import redis from "@/lib/redisClient";
import logger from "@/lib/logger";

// L1 In-Memory Cache (1-second TTL) for hyper-frequent same-instance reads
const l1Cache = new Map<string, { value: any; expiry: number }>();

export interface CacheOptions {
  ttl: number; // Base TTL in seconds
  negativeTtl?: number; // TTL for null/not found values (default: 30s)
  useJitter?: boolean; // Add 0-60s random jitter to base TTL
  useL1?: boolean; // Use the 1-second in-memory L1 cache
  bloomFilterKey?: string; // Redis Bloom Filter key to check presence
}

export async function getOrSetCache<T>(
  key: string,
  fetchFn: () => Promise<T | null>,
  options: CacheOptions,
): Promise<T | null> {
  const {
    ttl,
    negativeTtl = 30,
    useJitter = true,
    useL1 = true,
    bloomFilterKey,
  } = options;

  // 1. Check L1 In-Memory Cache (Sub-millisecond latency)
  if (useL1) {
    const l1Hit = l1Cache.get(key);
    if (l1Hit && Date.now() < l1Hit.expiry) {
      return l1Hit.value as T | null;
    }
  }

  // 1.5 Bloom Filter check (L3 defense)
  // If bloomFilterKey is provided, check if the ID possibly exists.
  // This prevents Redis from filling with garbage keys for IDs that never existed.
  if (bloomFilterKey) {
    try {
      // NOTE: Using raw call because ioredis doesn't have native BF.EXISTS types in all versions
      const exists = await redis.call("BF.EXISTS", bloomFilterKey, key);
      if (exists === 0) {
        // Bloom Filter is 100% sure this does not exist.
        // Return null without hitting Redis L2 or MongoDB.
        return null;
      }
    } catch (error: any) {
      // If the bloom filter module isn't installed or command fails,
      // we log it once and fall through to standard caching logic.
      logger.debug(
        { err: error.message, bloomFilterKey, key },
        "Bloom filter check skipped/failed",
      );
    }
  }

  try {
    // 2. Check L2 Redis Cache (Network latency ~1-5ms)
    const cachedData = await redis.get(key);

    if (cachedData !== null) {
      // It exists in Redis (could be a valid JSON object or the literal string "null")
      const parsed = JSON.parse(cachedData);

      // Populate L1 cache for the next second
      if (useL1) l1Cache.set(key, { value: parsed, expiry: Date.now() + 1000 });
      return parsed as T | null;
    }
  } catch (error) {
    // Fail gracefully on Redis errors, fall through to DB
    logger.warn({ err: error, key }, "Redis GET failed in getOrSetCache");
  }

  // 3. Cache Miss: Execute the Fetch Function (Database)
  let dbResult: T | null = null;
  try {
    dbResult = await fetchFn();
  } catch (error) {
    logger.error({ err: error, key }, "Database fetchFn failed");
    throw error; // Let the caller handle DB destruction
  }

  // 4. Cache the Result (Positive or Negative)
  try {
    if (dbResult !== null) {
      // Positive Cache: Add Jitter to prevent Avalanches
      const finalTtl = useJitter ? ttl + Math.floor(Math.random() * 60) : ttl;
      await redis.set(key, JSON.stringify(dbResult), "EX", finalTtl);
    } else {
      // Negative Cache: Prevent Cache Penetration (Phantom Key Attacks)
      await redis.set(key, JSON.stringify(null), "EX", negativeTtl);
    }
  } catch (error) {
    logger.warn({ err: error, key }, "Redis SET failed in getOrSetCache");
  }

  // 5. Populate L1 Cache before returning
  if (useL1) {
    l1Cache.set(key, { value: dbResult, expiry: Date.now() + 1000 });
  }

  return dbResult;
}

/**
 * Enterprise Validation Helper
 * Ensures IDs are valid MongoDB ObjectIds to stop basic penetration attacks
 * before they even touch the caching layer.
 */
export function isValidMongoId(id: string | null | undefined): boolean {
  if (!id) return false;
  return mongoose.Types.ObjectId.isValid(id);
}
