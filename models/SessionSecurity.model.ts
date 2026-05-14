import { Schema, model, models } from "mongoose";
import type { StepUpPurpose } from "@/models/StepUpChallenge.model";

export interface ISessionSecurity {
  userId: string;
  sessionId?: string | null;
  sessionToken?: string | null;
  sessionTokenHash?: string | null;
  ipAddress?: string | null;
  ipHash?: string | null;
  userAgent?: string | null;
  deviceFingerprint?: string | null;
  deviceLabel?: string | null;
  lastSeenAt?: Date | null;
  lastLoginMethod?: string | null;
  suspicious?: boolean;
  suspiciousReasons?: string[];
  stepUpVerifiedAt?: Partial<Record<StepUpPurpose, Date>>;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSecuritySchema = new Schema<ISessionSecurity>(
  {
    userId: { type: String, required: true, index: true },
    sessionId: { type: String, default: null, index: true },
    sessionToken: { type: String, default: null, index: true },
    sessionTokenHash: { type: String, default: null, index: true },
    ipAddress: { type: String, default: null },
    ipHash: { type: String, default: null, index: true },
    userAgent: { type: String, default: null },
    deviceFingerprint: { type: String, default: null, index: true },
    deviceLabel: { type: String, default: null },
    lastSeenAt: { type: Date, default: null },
    lastLoginMethod: { type: String, default: null },
    suspicious: { type: Boolean, default: false },
    suspiciousReasons: { type: [String], default: [] },
    stepUpVerifiedAt: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

sessionSecuritySchema.index({ userId: 1, updatedAt: -1 });
sessionSecuritySchema.index({ userId: 1, sessionTokenHash: 1 });
sessionSecuritySchema.index({ userId: 1, sessionId: 1 });

const SessionSecurity =
  models?.SessionSecurity ||
  model<ISessionSecurity>("SessionSecurity", sessionSecuritySchema);

export default SessionSecurity;
