import mongoose, { model, models, Schema } from "mongoose";

export interface ISubscription {
  user: mongoose.Types.ObjectId;
  planId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  status: "active" | "past_due" | "cancelled";
  currentPeriodEnd?: Date;
}

const SubscriptionSchema = new Schema<ISubscription>({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  planId: { type: String, default: "free" },

  stripeCustomerId: String,
  stripeSubscriptionId: String,

  status: {
    type: String,
    enum: ["active", "past_due", "cancelled"],
    default: "active",
  },

  currentPeriodEnd: Date,
});

export default models.Subscription ||
  model<ISubscription>("Subscription", SubscriptionSchema);
