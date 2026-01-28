import { Schema, model, models } from "mongoose";

export interface ISharedAsset {
  projectId: string;
  createdBy: string;
  title?: string;
  type: string; // e.g., "template", "prompt"
  content: any;
  visibility: "project" | "private" | "public";
  version: number;
  forkable?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const sharedAssetSchema = new Schema<ISharedAsset>(
  {
    projectId: { type: String, required: true, index: true },
    createdBy: { type: String, required: true },
    title: { type: String },
    type: { type: String, required: true },
    content: { type: Schema.Types.Mixed, required: true },
    visibility: {
      type: String,
      enum: ["project", "private", "public"],
      default: "project",
    },
    version: { type: Number, default: 1 },
    forkable: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const SharedAsset =
  models?.SharedAsset || model<ISharedAsset>("SharedAsset", sharedAssetSchema);
export default SharedAsset;
