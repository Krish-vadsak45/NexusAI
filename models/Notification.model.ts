import { Schema, model, models } from "mongoose";
import type { UnknownRecord } from "@/lib/shared-types";

export interface INotification {
  userId?: string;
  email?: string;
  type: string; // e.g., 'invite_sent', 'invite_accepted', 'role_changed'
  data: UnknownRecord;
  read?: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: String, index: true },
    email: { type: String, index: true },
    type: { type: String, required: true },
    data: { type: Schema.Types.Mixed },
    read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ email: 1, read: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });

const Notification =
  models?.Notification ||
  model<INotification>("Notification", notificationSchema);
export default Notification;
