import { describe, expect, it } from "vitest";
import { getHistoryItemsFromResponse } from "./history-utils";

describe("getHistoryItemsFromResponse", () => {
  it("returns items from paginated API responses", () => {
    const items = [{ _id: "1", title: "Example" }];

    expect(getHistoryItemsFromResponse({ items, nextCursor: null })).toEqual(
      items,
    );
  });

  it("supports legacy array payloads", () => {
    const items = [{ _id: "1", title: "Example" }];

    expect(getHistoryItemsFromResponse(items)).toEqual(items);
  });

  it("falls back to an empty array for unknown payloads", () => {
    expect(getHistoryItemsFromResponse(null)).toEqual([]);
    expect(getHistoryItemsFromResponse({})).toEqual([]);
  });
});
