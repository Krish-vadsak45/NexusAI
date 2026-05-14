import { describe, expect, it } from "vitest";
import { REDIS_RATE_LIMIT_SCRIPT } from "./rateLimit";

describe("REDIS_RATE_LIMIT_SCRIPT", () => {
  it("contains the expected Redis operations", () => {
    expect(REDIS_RATE_LIMIT_SCRIPT).toContain("ZREMRANGEBYSCORE");
    expect(REDIS_RATE_LIMIT_SCRIPT).toContain("ZADD");
    expect(REDIS_RATE_LIMIT_SCRIPT).toContain("ZCARD");
    expect(REDIS_RATE_LIMIT_SCRIPT).not.toContain(")all(");
  });
});
