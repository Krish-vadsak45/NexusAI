import { PLANS } from "@/lib/plans";
import connectToDatabase from "@/lib/db";
import Usage from "@/models/Usage.model";
import Subscription from "@/models/Subscription.model";

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

  // 3. Get or Create Usage Record
  let usage = await Usage.findOne({ userId });
  if (!usage) {
    usage = await Usage.create({ userId });
  }

  // 4. Check Daily Limits (Reset if new day)

  const limitKey = FEATURE_LIMIT_MAP[feature].limit;
  const usageKey = FEATURE_LIMIT_MAP[feature].usage;
  const currentUsage = usage[usageKey] || 0;
  const limit = plan.limits[limitKey];

  if (currentUsage >= limit) {
    return {
      allowed: false,
      message: `Daily limit reached for ${feature}. Limit: ${limit}/day. Please upgrade your plan.`,
    };
  }

  // 5. Check Token Limits (Daily)
  // Using tokensPerMonth as the daily limit value
  if (usage.tokensUsed >= plan.limits.tokensPerMonth) {
    return {
      allowed: false,
      message: `Daily token limit reached. Limit: ${plan.limits.tokensPerMonth} tokens.`,
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
 */
export async function incrementUsage(
  userId: string,
  feature: FeatureName,
  tokensUsed: number = 0
) {
  await connectToDatabase();

  let usage = await Usage.findOne({ userId });
  if (!usage) {
    usage = await Usage.create({ userId });
  }

  const usageKey = FEATURE_LIMIT_MAP[feature].usage;
  usage[usageKey] = (usage[usageKey] || 0) + 1;

  // Increment tokens
  if (tokensUsed > 0) {
    usage.tokensUsed = (usage.tokensUsed || 0) + tokensUsed;
  }

  await usage.save();
}
