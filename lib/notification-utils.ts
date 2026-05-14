export type NotificationMark = "read" | "unread" | "delete";

type MutableNotification = {
  read: boolean;
  deleteOne: () => Promise<unknown>;
  save: () => Promise<unknown>;
};

export function isNotificationMark(mark: unknown): mark is NotificationMark {
  return mark === "read" || mark === "unread" || mark === "delete";
}

export async function applyNotificationMark(
  notification: MutableNotification,
  mark: NotificationMark,
) {
  if (mark === "delete") {
    await notification.deleteOne();
    return "deleted" as const;
  }

  notification.read = mark === "read";
  await notification.save();
  return "saved" as const;
}
