import { NextResponse } from "next/server";
import { feedbackSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Server-side validation
    const result = feedbackSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.format() },
        { status: 400 }
      );
    }

    // Here you would typically save to a database
    console.log("Feedback submission received:", result.data);

    // Simulate database delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return NextResponse.json({ success: true, message: "Feedback submitted. Thank you!" });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
