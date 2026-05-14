import { describe, expect, it } from "vitest";
import {
  articleWriterRequestSchema,
  historyListResponseSchema,
  inviteRespondRequestSchema,
} from "./contracts";

describe("api contracts", () => {
  it("validates article writer requests", () => {
    const parsed = articleWriterRequestSchema.parse({
      topic: "AI future",
      tone: "professional",
      length: "medium",
      language: "english",
    });

    expect(parsed.topic).toBe("AI future");
  });

  it("rejects invalid invite response actions", () => {
    expect(() =>
      inviteRespondRequestSchema.parse({
        inviteId: "123",
        action: "maybe",
      }),
    ).toThrow();
  });

  it("validates history list responses", () => {
    const parsed = historyListResponseSchema.parse({
      items: [],
      nextCursor: null,
      totalCount: 0,
    });

    expect(parsed.totalCount).toBe(0);
  });
});
