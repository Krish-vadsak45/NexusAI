import { NextResponse } from "next/server";
import { ValidationError, withApiHandler } from "@/lib/errors";
import { contactSchema } from "@/lib/validations";
import logger from "@/lib/logger";
import { checkRateLimit } from "@/lib/rateLimit";

export const POST = withApiHandler(async (req: Request) => {
  const body = await req.json();
  const result = contactSchema.safeParse(body);

  if (!result.success) {
    throw new ValidationError("Validation failed", {
      details: result.error.format(),
    });
  }

  const forwardedFor =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const rateLimit = await checkRateLimit(`contact:${forwardedFor}`, 5, 15 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 },
    );
  }

  logger.info(
    {
      emailDomain: result.data.email.split("@")[1] || "unknown",
      subject: result.data.subject,
    },
    "Contact submission received",
  );
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return NextResponse.json({
    success: true,
    message: "Message sent successfully!",
  });
});
