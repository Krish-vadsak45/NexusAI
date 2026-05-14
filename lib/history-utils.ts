import type { HistoryItem } from "@/lib/shared-types";

export function getHistoryItemsFromResponse(data: unknown): HistoryItem[] {
  if (
    data &&
    typeof data === "object" &&
    "items" in data &&
    Array.isArray((data as { items?: unknown }).items)
  ) {
    return (data as { items: HistoryItem[] }).items;
  }

  if (Array.isArray(data)) {
    return data as HistoryItem[];
  }

  return [];
}
