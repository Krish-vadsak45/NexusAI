import { auth } from "@/lib/auth";
import {
  checkAndIncrementUsage,
  revertFeatureUsage,
  recordUsageResult,
} from "@/middleware/usage";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import logger from "@/lib/logger";

export async function POST(req: Request) {
  let session;
  try {
    // 1. Authentication Check
    session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to use this tool." },
        { status: 401 },
      );
    }

    // 2. Usage Check (Atomic)
    const userId = session.user.id;
    const usageCheck = await checkAndIncrementUsage(userId, "image_generation");
    if (!usageCheck.allowed) {
      return NextResponse.json({ error: usageCheck.message }, { status: 403 });
    }

    // 3. Input Validation
    const body = await req.json();
    const { prompt, style, size } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required and must be a string" },
        { status: 400 },
      );
    }

    // 4. Construct Prompt with Style
    let finalPrompt = prompt;
    if (style && style !== "natural") {
      finalPrompt = `${prompt}, in ${style} style`;
    }

    // 5. Generate Pollinations URL
    // Parse size (e.g., "1024x1024")
    let width = 1024;
    let height = 1024;
    if (size && typeof size === "string" && size.includes("x")) {
      const parts = size.split("x");
      const w = Number(parts[0]);
      const h = Number(parts[1]);
      if (!Number.isNaN(w)) width = w;
      if (!Number.isNaN(h)) height = h;
    }

    const encodedPrompt = encodeURIComponent(finalPrompt);
    const seed = Math.floor(Math.random() * 1000000);

    // Pollinations.ai URL structure
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

    // 6. Record Usage Success
    // Pollinations is free, so we assign a lower token cost (e.g., 500)
    // just to track activity against the monthly limit.
    await recordUsageResult(userId, "image_generation", 500, "success");

    return NextResponse.json({
      url: imageUrl,
      prompt: finalPrompt,
    });
  } catch (error) {
    logger.error({ err: error }, "Image Generation Error");

    // Revert Usage on Error
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (session?.user?.id) {
      await revertFeatureUsage(session.user.id, "image_generation");
      await recordUsageResult(session.user.id, "image_generation", 0, "fail");
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
