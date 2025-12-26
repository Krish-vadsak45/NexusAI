import { auth } from "@/lib/auth";
import { checkUsage, incrementUsage } from "@/middleware/usage";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Authentication Check
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to use this tool." },
        { status: 401 }
      );
    }

    // 2. Usage Check
    const userId = session.user.id;
    const usageCheck = await checkUsage(userId, "image_generation");
    if (!usageCheck.allowed) {
      return NextResponse.json({ error: usageCheck.message }, { status: 403 });
    }

    // 3. Input Validation
    const body = await req.json();
    const { prompt, style, size } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required and must be a string" },
        { status: 400 }
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
      const [w, h] = size.split("x").map(Number);
      if (!isNaN(w)) width = w;
      if (!isNaN(h)) height = h;
    }

    const encodedPrompt = encodeURIComponent(finalPrompt);
    const seed = Math.floor(Math.random() * 1000000);

    // Pollinations.ai URL structure
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

    // 6. Increment Usage
    // Pollinations is free, so we assign a lower token cost (e.g., 500)
    // just to track activity against the monthly limit.
    await incrementUsage(userId, "image_generation", 500);

    return NextResponse.json({
      url: imageUrl,
      prompt: finalPrompt,
    });
  } catch (error) {
    console.error("Image Generation Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
