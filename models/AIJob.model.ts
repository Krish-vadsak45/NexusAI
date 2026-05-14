import { Schema, model, models } from "mongoose";

export interface IAIJob {
  userId: string;
  type: string;
  status: "pending" | "processing" | "completed" | "failed";
  idempotencyKey: string;
  payload: Record<string, unknown>;
  result?: Record<string, unknown>;
  error?: string | null;
  requestId?: string;
  attempts: number;
  maxAttempts: number;
  startedAt?: Date | null;
  completedAt?: Date | null;
  metrics?: {
    durationMs?: number;
    estimatedTokens?: number;
    promptTokens?: number;
    completionTokens?: number;
  };
}

const aiJobSchema = new Schema<IAIJob>(
  {
    userId: { type: String, required: true, index: true },
    type: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
      index: true,
    },
    idempotencyKey: { type: String, required: true, unique: true, index: true },
    payload: { type: Schema.Types.Mixed, required: true },
    result: { type: Schema.Types.Mixed },
    error: { type: String, default: null },
    requestId: { type: String },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    metrics: {
      durationMs: { type: Number },
      estimatedTokens: { type: Number },
      promptTokens: { type: Number },
      completionTokens: { type: Number },
    },
  },
  { timestamps: true },
);

aiJobSchema.index({ userId: 1, type: 1, createdAt: -1 });

const AIJob = models?.AIJob || model<IAIJob>("AIJob", aiJobSchema);

export default AIJob;
