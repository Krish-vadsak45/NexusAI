import { Schema, model, models } from "mongoose";

export type StepUpPurpose =
  | "billing:manage"
  | "project:delete"
  | "project:invite:manage"
  | "project:member:role"
  | "api-key:create";

export interface IStepUpChallenge {
  userId: string;
  sessionTokenHash: string;
  purpose: StepUpPurpose;
  codeHash: string;
  expiresAt: Date;
  attempts: number;
  consumedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const stepUpChallengeSchema = new Schema<IStepUpChallenge>(
  {
    userId: { type: String, required: true, index: true },
    sessionTokenHash: { type: String, required: true, index: true },
    purpose: {
      type: String,
      required: true,
      enum: [
        "billing:manage",
        "project:delete",
        "project:invite:manage",
        "project:member:role",
        "api-key:create",
      ],
      index: true,
    },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    attempts: { type: Number, default: 0 },
    consumedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

stepUpChallengeSchema.index(
  { userId: 1, sessionTokenHash: 1, purpose: 1 },
  { unique: true },
);

const StepUpChallenge =
  models?.StepUpChallenge ||
  model<IStepUpChallenge>("StepUpChallenge", stepUpChallengeSchema);

export default StepUpChallenge;
