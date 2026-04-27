import { NextResponse } from "next/server";
import { ValidationError, withApiHandler } from "@/lib/errors";
import { feedbackSchema } from "@/lib/validations";
import logger from "@/lib/logger";

export const POST = withApiHandler(async (req: Request) => {
  const body = await req.json();
  const result = feedbackSchema.safeParse(body);

  if (!result.success) {
    throw new ValidationError("Validation failed", {
      details: result.error.format(),
    });
  }

  logger.info({ data: result.data }, "Feedback submission received");
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return NextResponse.json({
    success: true,
    message: "Feedback submitted. Thank you!",
  });
});
