import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover", // Use the latest API version
  typescript: true,
});

// Helper to map Plan IDs to Stripe Price IDs
export const PLAN_ID_TO_PRICE_ID = {
  pro: process.env.STRIPE_PRICE_ID_PRO!,
  premium: process.env.STRIPE_PRICE_ID_PREMIUM!,
};

// Helper to map Stripe Price IDs back to Plan IDs (for webhooks)
export function getPlanIdFromPriceId(priceId: string): string {
  if (priceId === process.env.STRIPE_PRICE_ID_PRO) return "pro";
  if (priceId === process.env.STRIPE_PRICE_ID_PREMIUM) return "premium";
  return "free";
}
