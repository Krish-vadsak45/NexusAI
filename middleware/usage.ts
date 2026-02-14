import { PLANS } from "@/lib/plans";
import connectToDatabase from "@/lib/db";
import mongoose from "mongoose";
import Usage from "@/models/Usage.model";
import Subscription from "@/models/Subscription.model";
import DailyUsage from "@/models/DailyUsage.model";

// Map feature names to their limit keys in PLANS and usage keys in Usage model
export const FEATURE_LIMIT_MAP = {
  article_writer: { limit: "articlesPerDay", usage: "articlesGenerated" },
  title_generator: { limit: "titlesPerDay", usage: "titlesGenerated" },
  image_generation: { limit: "imagesPerDay", usage: "imagesGenerated" },
  background_removal: {
    limit: "backgroundRemovalsPerDay",
    usage: "backgroundRemovals",
  },
  object_removal: { limit: "objectRemovalsPerDay", usage: "objectRemovals" },
  resume_reviewer: { limit: "resumeReviewsPerDay", usage: "resumeReviews" },
  text_summarizer: { limit: "textSummariesPerDay", usage: "textSummaries" },
  code_generator: { limit: "codeGenerationsPerDay", usage: "codeGenerations" },
  video_repurposer: { limit: "videoRepurposePerDay", usage: "videoRepurpose" },
} as const;

export type FeatureName = keyof typeof FEATURE_LIMIT_MAP;

/**
 * Checks if a user has access to a feature and has not exceeded limits.
 * @param userId The user's ID
 * @param feature The feature to check
 * @returns { allowed: boolean, message?: string }
 */
export async function checkUsage(userId: string, feature: FeatureName) {
  await connectToDatabase();

  // 1. Get User's Plan
  const subscription = await Subscription.findOne({ user: userId });
  const planId = subscription?.planId || "free";
  const planKey = planId.toUpperCase() as keyof typeof PLANS;
  const plan = PLANS[planKey];

  if (!plan) {
    return { allowed: false, message: "Invalid plan" };
  }

  // 2. Check if feature is not enabled in plan
  if (!plan.features[feature]) {
    return {
      allowed: false,
      message: `This feature is not available on the ${plan.name} plan. Please upgrade.`,
    };
  }

  // 3. Get or Create Usage Record with atomic reset if new day
  const now = new Date();
  const startOfToday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );

  let usage = await Usage.findOne({ userId });

  if (!usage) {
    usage = await Usage.create({ userId, date: startOfToday });
  } else {
    // Check if daily reset is needed (using UTC to be consistent)
    const usageDate = new Date(usage.date);
    const startOfUsageDate = new Date(
      Date.UTC(
        usageDate.getUTCFullYear(),
        usageDate.getUTCMonth(),
        usageDate.getUTCDate(),
      ),
    );

    if (startOfToday > startOfUsageDate) {
      // New day reset
      usage = await Usage.findOneAndUpdate(
        { userId },
        {
          $set: {
            date: startOfToday,
            articlesGenerated: 0,
            titlesGenerated: 0,
            imagesGenerated: 0,
            backgroundRemovals: 0,
            objectRemovals: 0,
            resumeReviews: 0,
            textSummaries: 0,
            codeGenerations: 0,
            videoRepurpose: 0,
          },
        },
        { new: true },
      );
    }

    // Monthly Token Reset
    const lastTokenReset = new Date(usage.lastTokenReset);
    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(now.getMonth() - 1);

    if (lastTokenReset < oneMonthAgo) {
      usage = await Usage.findOneAndUpdate(
        { userId },
        {
          $set: {
            tokensUsed: 0,
            lastTokenReset: now,
          },
        },
        { new: true },
      );
    }
  }

  const limitKey = FEATURE_LIMIT_MAP[feature].limit;
  const usageKey = FEATURE_LIMIT_MAP[feature].usage;
  const currentUsage = (usage[usageKey] as number) || 0;
  const limit = plan.limits[limitKey];

  if (currentUsage >= limit) {
    return {
      allowed: false,
      message: `Daily limit reached for ${feature}. Limit: ${limit}/day. Please upgrade your plan.`,
    };
  }

  // 5. Check Token Limits (Monthly)
  if (usage.tokensUsed >= plan.limits.tokensPerMonth) {
    return {
      allowed: false,
      message: `Monthly token limit reached. Limit: ${plan.limits.tokensPerMonth.toLocaleString()} tokens.`,
    };
  }

  return { allowed: true };
}

/**
 * Increments the usage counter for a feature and tokens.
 * Handles daily resets automatically.
 * @param userId The user's ID
 * @param feature The feature used
 * @param tokensUsed Number of tokens consumed (optional)
 * @param status Status of the usage (optional: 'success' | 'fail')
 */
export async function incrementUsage(
  userId: string,
  feature: FeatureName,
  tokensUsed: number = 0,
  status?: "success" | "fail",
) {
  await connectToDatabase();

  const usageKey = FEATURE_LIMIT_MAP[feature].usage;

  // 1. Update Real-time Limits (Usage Model)
  // We use findOneAndUpdate with $inc for atomicity
  const usageUpdate = Usage.findOneAndUpdate(
    { userId },
    {
      $inc: {
        [usageKey]: 1,
        tokensUsed: tokensUsed,
      },
    },
    { upsert: true },
  );

  // 2. Log Historical Daily Usage (DailyUsage Model)
  const now = new Date();
  const startOfToday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );

  const dailyInc: any = {
    count: 1,
    tokens: tokensUsed,
  };

  if (status === "success") {
    dailyInc.success = 1;
  } else if (status === "fail") {
    dailyInc.fail = 1;
  }

  const historyUpdate = DailyUsage.findOneAndUpdate(
    {
      userId,
      date: startOfToday,
      feature: feature,
    },
    {
      $inc: dailyInc,
    },
    { upsert: true },
  );

  // Run both updates in parallel for performance
  await Promise.all([usageUpdate, historyUpdate]);
}

/**
 * Gets a summary of usage and limits for a user.
 * @param userId The user's ID
 */
export async function getUsageSummary(userId: string) {
  await connectToDatabase();

  const subscription = await Subscription.findOne({ user: userId });
  const planId = subscription?.planId || "free";
  const planKey = planId.toUpperCase() as keyof typeof PLANS;
  const plan = PLANS[planKey];

  let usage = await Usage.findOne({ userId });
  if (!usage) {
    usage = await Usage.create({ userId });
  }

  const now = new Date();

  // 1. Calculate the total tokens used in the current month across all tools and days
  const startOfMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );

  const monthlyTokenAggregation = await DailyUsage.aggregate([
    {
      $match: {
        $or: [
          { userId: userId },
          { userId: new mongoose.Types.ObjectId(userId) },
        ],
        date: { $gte: startOfMonth },
      },
    },
    {
      $group: {
        _id: "$feature",
        totalTokens: { $sum: "$tokens" },
      },
    },
  ]);

  // Create a map for tool-wise monthly tokens
  const toolMonthlyMap = monthlyTokenAggregation.reduce(
    (acc, item) => {
      acc[item._id] = item.totalTokens;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Calculate the grand total for the current month across all tools
  const totalMonthlyTokens = monthlyTokenAggregation.reduce(
    (sum, item) => sum + item.totalTokens,
    0,
  );

  const startOfToday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const usageDate = new Date(usage.date);
  const startOfUsageDate = new Date(
    Date.UTC(
      usageDate.getUTCFullYear(),
      usageDate.getUTCMonth(),
      usageDate.getUTCDate(),
    ),
  );

  if (startOfToday > startOfUsageDate) {
    usage = await Usage.findOneAndUpdate(
      { userId },
      {
        $set: {
          date: startOfToday,
          articlesGenerated: 0,
          titlesGenerated: 0,
          imagesGenerated: 0,
          backgroundRemovals: 0,
          objectRemovals: 0,
          resumeReviews: 0,
          textSummaries: 0,
          codeGenerations: 0,
          videoRepurpose: 0,
        },
      },
      { new: true },
    );
  }

  const summary = Object.entries(FEATURE_LIMIT_MAP).map(
    ([feature, mapping]) => {
      const limitKey = mapping.limit;
      const usageKey = mapping.usage;
      return {
        feature,
        used: usage[usageKey] || 0,
        monthlyTokens: toolMonthlyMap[feature] || 0,
        limit: plan.limits[limitKey],
        label: feature
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
      };
    },
  );

  return {
    planName: plan.name,
    usage: summary,
    tokens: {
      used: totalMonthlyTokens,
      limit: plan.limits.tokensPerMonth,
    },
  };
}
