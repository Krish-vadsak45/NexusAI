import mongoose, { Schema, model, models } from "mongoose";

export interface IUsage {
  userId: mongoose.Types.ObjectId;
  subscriptionId: mongoose.Types.ObjectId;
  date: Date; // Track the date for daily limits reset

  // Daily counters
  articlesGenerated: number;
  titlesGenerated: number;
  imagesGenerated: number;
  backgroundRemovals: number;
  objectRemovals: number;
  resumeReviews: number;
  textSummaries: number;
  codeGenerations: number;

  // Monthly counters
  tokensUsed: number;
  lastTokenReset: Date;
}

const usageSchema = new Schema<IUsage>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
    },
    date: { type: Date, default: Date.now },

    articlesGenerated: { type: Number, default: 0 },
    titlesGenerated: { type: Number, default: 0 },
    imagesGenerated: { type: Number, default: 0 },
    backgroundRemovals: { type: Number, default: 0 },
    objectRemovals: { type: Number, default: 0 },
    resumeReviews: { type: Number, default: 0 },
    textSummaries: { type: Number, default: 0 },
    codeGenerations: { type: Number, default: 0 },

    tokensUsed: { type: Number, default: 0 },
    lastTokenReset: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

const Usage = models?.Usage || model<IUsage>("Usage", usageSchema);

export default Usage;
