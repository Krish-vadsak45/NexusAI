import Redis from "ioredis";
import logger from "./logger";

type RedisClientLike = Pick<
  Redis,
  "call" | "del" | "eval" | "get" | "keys" | "set"
>;

const redisUrl = process.env.REDIS_URL || process.env.REDIS_URI;

const globalForRedis = globalThis as unknown as {
  redis: RedisClientLike | undefined;
};

const createNoopRedisClient = (): RedisClientLike => ({
  async call() {
    return null;
  },
  async del() {
    return 0;
  },
  async eval() {
    return [1, 0];
  },
  async get() {
    return null;
  },
  async keys() {
    return [];
  },
  async set() {
    return "OK";
  },
});

const createRedisClient = (): RedisClientLike => {
  if (!redisUrl) {
    logger.info(
      "REDIS_URL not configured; using in-process no-op cache client",
    );
    return createNoopRedisClient();
  }

  const client = new Redis(redisUrl, {
    enableOfflineQueue: false,
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy: () => null,
  });

  client.on("error", (err) => {
    logger.warn({ err }, "Redis client error");
  });

  return client;
};

const client = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = client;
}

export default client;
