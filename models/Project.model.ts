import { Schema, model, models } from "mongoose";

export interface IProject {
  userId: string;
  name: string;
  description?: string;
  members: {
    userId: string;
    role: "owner" | "editor" | "viewer";
    invitedBy?: string;
    inviteStatus: "accepted" | "pending" | "declined";
    joinedAt: Date;
    permissionsOverrides?: Record<string, any>;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    members: [
      {
        userId: { type: String, required: true, index: true },
        role: {
          type: String,
          enum: ["owner", "editor", "viewer"],
          required: true,
          default: "viewer",
        },
        invitedBy: { type: String },
        inviteStatus: {
          type: String,
          enum: ["accepted", "pending", "declined"],
          default: "accepted",
        },
        joinedAt: { type: Date, default: Date.now },
        permissionsOverrides: { type: Schema.Types.Mixed },
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Project = models?.Project || model<IProject>("Project", projectSchema);
export default Project;
