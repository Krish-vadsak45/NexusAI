import Redis from "ioredis";
import logger from "./logger";

const redisUrl =
  process.env.REDIS_URL || process.env.REDIS_URI || "redis://127.0.0.1:6379";

const client = new Redis(redisUrl);

client.on("error", (err) => {
  logger.warn({ err }, "Redis client error");
});

export default client;
