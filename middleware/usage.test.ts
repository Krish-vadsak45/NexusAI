import { describe, expect, it } from "vitest";
import {
  getStartOfUtcDay,
  shouldResetDailyUsage,
  shouldResetMonthlyTokens,
} from "./usage-helpers";

describe("usage helpers", () => {
  it("normalizes dates to UTC day boundaries", () => {
    const date = new Date("2026-05-14T13:22:10.000Z");
    expect(getStartOfUtcDay(date).toISOString()).toBe("2026-05-14T00:00:00.000Z");
  });

  it("detects daily resets", () => {
    expect(
      shouldResetDailyUsage(
        new Date("2026-05-15T00:00:00.000Z"),
        new Date("2026-05-14T23:59:59.000Z"),
      ),
    ).toBe(true);
  });

  it("detects monthly token resets", () => {
    expect(
      shouldResetMonthlyTokens(
        new Date("2026-05-14T00:00:00.000Z"),
        new Date("2026-04-01T00:00:00.000Z"),
      ),
    ).toBe(true);
  });
});
