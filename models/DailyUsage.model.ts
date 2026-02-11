import mongoose, { Schema, model, models } from "mongoose";

export interface IDailyUsage {
  userId: mongoose.Types.ObjectId;
  date: Date; // Start of the day in UTC
  feature: string;
  tokens: number;
  count: number; // Total attempts
  success: number;
  fail: number;
}

const dailyUsageSchema = new Schema<IDailyUsage>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    feature: {
      type: String,
      required: true,
      index: true,
    },
    tokens: {
      type: Number,
      default: 0,
    },
    count: {
      type: Number,
      default: 0,
    },
    success: {
      type: Number,
      default: 0,
    },
    fail: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for fast lookup/upsert and uniqueness
dailyUsageSchema.index({ userId: 1, date: 1, feature: 1 }, { unique: true });

const DailyUsage =
  models?.DailyUsage || model<IDailyUsage>("DailyUsage", dailyUsageSchema);

export default DailyUsage;
