import { auth } from "@/lib/auth";
import { checkUsage, incrementUsage } from "@/middleware/usage";
import axios from "axios";
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
    const usageCheck = await checkUsage(userId, "text_summarizer");
    if (!usageCheck.allowed) {
      return NextResponse.json({ error: usageCheck.message }, { status: 403 });
    }

    // 3. Input Validation
    const body = await req.json();
    const { text, length, format, focus } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server configuration error: API key missing" },
        { status: 500 }
      );
    }

    // 4. Prompt Construction
    let lengthInstruction = "medium length";
    if (length === "short") lengthInstruction = "very concise and short";
    if (length === "long") lengthInstruction = "detailed and comprehensive";

    let formatInstruction = "paragraph format";
    if (format === "bullet-points") formatInstruction = "bullet points list";

    let focusInstruction = "provide a general summary";
    if (focus === "action-items")
      focusInstruction = "extract actionable items and tasks";
    if (focus === "eli5")
      focusInstruction = "explain it simply as if to a 5-year-old";
    if (focus === "key-takeaways")
      focusInstruction = "extract the main key takeaways and insights";

    const prompt = `
      Task: Analyze and summarize the following text.
      
      Configuration:
      - Goal: ${focusInstruction}
      - Length: ${lengthInstruction}
      - Format: ${formatInstruction}
      
      Text to analyze:
      "${text}"
      
      Output just the content, no introductory text or markdown formatting wrappers.
    `;

    // 5. Call Gemini API
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: { "Content-Type": "application/json" },
        validateStatus: () => true,
      }
    );

    if (response.status !== 200) {
      console.error("Gemini API Error:", response.data);
      return NextResponse.json(
        { error: "Failed to generate summary" },
        { status: 500 }
      );
    }

    const generatedText =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Failed to generate summary.";

    // 6. Increment Usage
    // Estimate tokens (rough approximation: 1 token ~= 4 chars)
    const inputTokens = Math.ceil(text.length / 4);
    const outputTokens = Math.ceil(generatedText.length / 4);
    const totalTokens = inputTokens + outputTokens;

    await incrementUsage(userId, "text_summarizer", totalTokens);

    return NextResponse.json({
      summary: generatedText.trim(),
    });
  } catch (error: any) {
    console.error("Text Summarizer Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
