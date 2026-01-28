import Redis from "ioredis";

const redisUrl =
  process.env.REDIS_URL || process.env.REDIS_URI || "redis://127.0.0.1:6379";

const client = new Redis(redisUrl);

client.on("error", (err) => {
  console.warn("Redis client error", err);
});

export default client;
