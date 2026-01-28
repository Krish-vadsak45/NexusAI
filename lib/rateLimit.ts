import redisClient from "./redisClient";

const inMemoryStore = new Map<string, number[]>();

async function checkRateLimitRedis(
  key: string,
  limit = 10,
  windowMs = 1000 * 60 * 60,
) {
  const now = Date.now();
  const redisKey = `rl:${key}`;
  const script = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local windowMs = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local windowStart = now - windowMs
redis.call('ZREMRANGEBYSCORE', key, 0, windowStart)
redis.call('ZADD', key, now, tostring(now))
redis.call('EXPIRE', key, math.floor(windowMs/1000) + 2)
local count = redis.call('ZCARD', key)
local earliest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
if earliest and #earliest > 0 then
  return {tostring(count), tostring(earliest[2])}
else
  return {tostring(count), "-1"}
end
`;

  try {
    const res = (await redisClient.eval(
      script,
      1,
      redisKey,
      now.toString(),
      windowMs.toString(),
      limit.toString(),
    )) as Array<string>;
    const count = Number(res[0] || "0");
    const earliest = Number(res[1] || -1);
    const allowed = count <= limit;
    const remaining = Math.max(0, limit - count);
    let resetSeconds = 0;
    if (earliest > 0) {
      const msLeft = windowMs - (Date.now() - earliest);
      resetSeconds = Math.max(0, Math.ceil(msLeft / 1000));
    }
    return { allowed, remaining, resetSeconds };
  } catch (e) {
    console.warn("redis rate limit check failed", e);
    // fallthrough to in-memory fallback
    return null;
  }
}

function checkRateLimitMemory(
  key: string,
  limit = 10,
  windowMs = 1000 * 60 * 60,
) {
  const now = Date.now();
  const windowStart = now - windowMs;
  const hits = inMemoryStore.get(key) || [];
  const recent = hits.filter((ts) => ts > windowStart);
  recent.push(now);
  inMemoryStore.set(key, recent);
  const allowed = recent.length <= limit;
  const remaining = Math.max(0, limit - recent.length);
  const earliest = recent.length > 0 ? recent[0] : -1;
  let resetSeconds = 0;
  if (earliest > 0) {
    const msLeft = windowMs - (Date.now() - earliest);
    resetSeconds = Math.max(0, Math.ceil(msLeft / 1000));
  }
  return { allowed, remaining, resetSeconds };
}

export async function checkRateLimit(
  key: string,
  limit = 10,
  windowMs = 1000 * 60 * 60,
) {
  // prefer Redis when available; if Redis fails, fallback to in-memory
  try {
    if (process.env.REDIS_URL || process.env.REDIS_URI) {
      const r = await checkRateLimitRedis(key, limit, windowMs);
      if (r) return r;
    }
  } catch (e) {
    console.warn("redis checkRateLimit error", e);
  }
  return checkRateLimitMemory(key, limit, windowMs);
}

export async function resetRateLimit(key: string) {
  try {
    if (process.env.REDIS_URL || process.env.REDIS_URI) {
      await redisClient.del(`rl:${key}`);
      return;
    }
  } catch (e) {
    console.warn("redis reset failed", e);
  }
  inMemoryStore.delete(key);
}

export default { checkRateLimit, resetRateLimit };
