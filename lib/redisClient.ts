import Redis from "ioredis";
import logger from "./logger";

const redisUrl =
  process.env.REDIS_URL || process.env.REDIS_URI || "redis://127.0.0.1:6379";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

const client = globalForRedis.redis ?? new Redis(redisUrl);

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = client;
}

client.on("error", (err) => {
  logger.warn({ err }, "Redis client error");
});

export default client;
