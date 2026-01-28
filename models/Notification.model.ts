import { Schema, model, models } from "mongoose";

export interface INotification {
  userId?: string;
  email?: string;
  type: string; // e.g., 'invite_sent', 'invite_accepted', 'role_changed'
  data: any;
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

const Notification =
  models?.Notification ||
  model<INotification>("Notification", notificationSchema);
export default Notification;
