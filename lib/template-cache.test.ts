import { describe, expect, it } from "vitest";
import {
  buildTemplateCacheKey,
  buildTemplateQuery,
  isTemplateQueryCacheable,
} from "./template-cache";

describe("template cache helpers", () => {
  it("builds a public-only query for guests", () => {
    expect(buildTemplateQuery("blog", null, null, null)).toEqual({
      category: "blog",
      isPublic: true,
    });
  });

  it("builds a mixed query for signed-in users by default", () => {
    expect(
      buildTemplateQuery("blog", null, null, {
        user: { id: "user-1" },
      }),
    ).toEqual({
      category: "blog",
      $or: [{ isPublic: true }, { userId: "user-1" }],
    });
  });

  it("scopes cache keys by user and filter", () => {
    const guestKey = buildTemplateCacheKey({
      category: "blog",
      filter: null,
      limit: 20,
      page: 1,
      search: null,
      session: null,
    });
    const userKey = buildTemplateCacheKey({
      category: "blog",
      filter: null,
      limit: 20,
      page: 1,
      search: null,
      session: { user: { id: "user-1" } },
    });

    expect(guestKey).not.toBe(userKey);
    expect(userKey).toContain("scope:user:user-1");
    expect(userKey).toContain("filter:mixed");
  });

  it("only caches non-search queries", () => {
    expect(isTemplateQueryCacheable(null)).toBe(true);
    expect(isTemplateQueryCacheable("video")).toBe(false);
  });
});
