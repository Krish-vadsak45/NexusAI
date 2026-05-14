import { describe, expect, it, vi } from "vitest";
import {
  applyNotificationMark,
  isNotificationMark,
} from "./notification-utils";

describe("notification utils", () => {
  it("validates supported notification marks", () => {
    expect(isNotificationMark("read")).toBe(true);
    expect(isNotificationMark("unread")).toBe(true);
    expect(isNotificationMark("delete")).toBe(true);
    expect(isNotificationMark("archive")).toBe(false);
  });

  it("saves read and unread changes", async () => {
    const notification = {
      read: false,
      deleteOne: vi.fn(),
      save: vi.fn(),
    };

    await applyNotificationMark(notification, "read");
    expect(notification.read).toBe(true);
    expect(notification.save).toHaveBeenCalledTimes(1);
    expect(notification.deleteOne).not.toHaveBeenCalled();
  });

  it("deletes without saving", async () => {
    const notification = {
      read: false,
      deleteOne: vi.fn(),
      save: vi.fn(),
    };

    await applyNotificationMark(notification, "delete");
    expect(notification.deleteOne).toHaveBeenCalledTimes(1);
    expect(notification.save).not.toHaveBeenCalled();
  });
});
