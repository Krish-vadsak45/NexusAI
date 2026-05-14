import { Schema, model, models } from "mongoose";

export interface IInvite {
  token: string;
  projectId: string;
  email: string;
  role: "owner" | "editor" | "viewer";
  invitedBy: string;
  status: "pending" | "claimed" | "revoked" | "declined";
  expiresAt: Date;
  createdAt: Date;
  claimedAt?: Date;
  claimToken?: string;
  claimTokenExpires?: Date;
}

const inviteSchema = new Schema<IInvite>(
  {
    token: { type: String, required: true, index: true, unique: true },
    projectId: { type: String, required: true, index: true },
    email: { type: String, required: true, index: true },
    role: {
      type: String,
      enum: ["owner", "editor", "viewer"],
      default: "viewer",
    },
    invitedBy: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "claimed", "revoked", "declined"],
      default: "pending",
    },
    expiresAt: { type: Date, required: true },
    claimedAt: { type: Date },
    claimToken: { type: String, index: true },
    claimTokenExpires: { type: Date },
  },
  { timestamps: true },
);

inviteSchema.index({ projectId: 1, status: 1, createdAt: -1 });
inviteSchema.index({ email: 1, status: 1, expiresAt: 1 });
inviteSchema.index({ invitedBy: 1, createdAt: -1 });

const Invite = models?.Invite || model<IInvite>("Invite", inviteSchema);
export default Invite;
