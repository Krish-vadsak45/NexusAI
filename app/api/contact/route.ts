import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validations";
import logger from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Server-side validation
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.format() },
        { status: 400 },
      );
    }

    // Here you would typically send an email or save to a database
    logger.info({ data: result.data }, "Contact submission received");

    // Simulate database delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      message: "Message sent successfully!",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
