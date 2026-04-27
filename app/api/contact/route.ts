import { NextResponse } from "next/server";
import { ValidationError, withApiHandler } from "@/lib/errors";
import { contactSchema } from "@/lib/validations";
import logger from "@/lib/logger";

export const POST = withApiHandler(async (req: Request) => {
  const body = await req.json();
  const result = contactSchema.safeParse(body);

  if (!result.success) {
    throw new ValidationError("Validation failed", {
      details: result.error.format(),
    });
  }

  logger.info({ data: result.data }, "Contact submission received");
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return NextResponse.json({
    success: true,
    message: "Message sent successfully!",
  });
});
