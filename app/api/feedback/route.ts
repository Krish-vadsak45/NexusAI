export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { ValidationError, withApiHandler } from "@/lib/errors";
import { feedbackSchema } from "@/lib/validations";
import logger from "@/lib/logger";
import { checkRateLimit } from "@/lib/rateLimit";



export const POST = withApiHandler(async (req: Request) => {
  const body = await req.json();
  const result = feedbackSchema.safeParse(body);

  if (!result.success) {
    throw new ValidationError("Validation failed", {
      details: result.error.format(),
    });
  }

  const forwardedFor =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const rateLimit = await checkRateLimit(`feedback:${forwardedFor}`, 5, 15 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 },
    );
  }

  logger.info(
    {
      category:
        "category" in result.data && typeof result.data.category === "string"
          ? result.data.category
          : "general",
    },
    "Feedback submission received",
  );
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return NextResponse.json({
    success: true,
    message: "Feedback submitted. Thank you!",
  });
});