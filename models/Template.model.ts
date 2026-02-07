import mongoose, { Schema, model, models } from "mongoose";
import "./user.model";
import "./Project.model";

export interface ITemplateVersion {
  version: number;
  content: string;
  metadata?: Record<string, any>;
  changelog?: string;
  authorId?: mongoose.Types.ObjectId | string;
  createdAt: Date;
}

export interface ITemplate {
  _id?: mongoose.Types.ObjectId | string;
  userId: mongoose.Types.ObjectId | string;
  projectId?: mongoose.Types.ObjectId | string;
  title: string;
  description?: string;
  tags: string[];
  isPublic: boolean;
  category: string;
  versions: ITemplateVersion[];
  currentVersion: number;
  forkedFrom?: mongoose.Types.ObjectId | string;
  ratingSum: number;
  ratingCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const templateVersionSchema = new Schema<ITemplateVersion>({
  version: { type: Number, required: true },
  content: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed },
  changelog: { type: String },
  authorId: { type: Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

const templateSchema = new Schema<ITemplate>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    tags: [{ type: String }],
    isPublic: { type: Boolean, default: false },
    category: { type: String, required: true },
    versions: [templateVersionSchema],
    currentVersion: { type: Number, default: 1 },
    forkedFrom: { type: Schema.Types.ObjectId, ref: "Template" },
    ratingSum: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

templateSchema.index({ userId: 1 });
templateSchema.index({ isPublic: 1 });
templateSchema.index({ tags: 1 });
templateSchema.index({ category: 1 });
templateSchema.index({ title: "text", description: "text", tags: "text" });

const Template =
  models?.Template || model<ITemplate>("Template", templateSchema);

export default Template;
