// models/Subscription.ts
import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema({
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

export default mongoose.models.Subscription ||
  mongoose.model("Subscription", SubscriptionSchema);
