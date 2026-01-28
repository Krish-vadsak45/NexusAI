import mongoose, { Schema, model, models } from "mongoose";

export interface IHistory {
  userId: string;
  projectId?: string; // Optional: to associate with a project
  tool: string; // e.g., "ArticleWriter", "TitleGenerator"
  title: string; // A short display title (e.g., the topic)
  input: any; // The form values used
  output: any; // The generated result
  createdAt: Date;
}

const historySchema = new Schema<IHistory>(
  {
    userId: { type: String, required: true, index: true },
    projectId: { type: String, index: true },
    tool: { type: String, required: true },
    title: { type: String, required: true },
    input: { type: Schema.Types.Mixed, required: true },
    output: { type: Schema.Types.Mixed, required: true },
  },
  {
    timestamps: true,
  }
);

const History = models?.History || model<IHistory>("History", historySchema);

export default History;
