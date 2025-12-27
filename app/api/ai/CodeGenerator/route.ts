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

    // --- CHECK USAGE ---
    const userId = session.user.id;
    const usageCheck = await checkUsage(userId, "code_generator");
    if (!usageCheck.allowed) {
      return NextResponse.json({ error: usageCheck.message }, { status: 403 });
    }

    // 2. Input Validation
    const body = await req.json();
    const { prompt, language } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required and must be a string" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server configuration error: API key missing" },
        { status: 500 }
      );
    }

    // 3. Prompt Construction
    const systemPrompt = `
      Act as an expert software developer.
      
      Task: Generate high-quality, efficient, and well-commented code based on the user's request.
      
      Configuration:
      - Language: ${language || "javascript"}
      - Request: "${prompt}"
      
      You must return a valid JSON object with the following structure:
      {
        "code": "The generated code string. Use \\n for newlines.",
        "explanation": "A brief explanation of how the code works."
      }

      Ensure the JSON is valid and strictly follows this structure.
      Do not include markdown formatting (like \`\`\`json) around the output, just the raw JSON string.
    `;

    // 4. Call Gemini API
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          maxOutputTokens: 8192,
        },
      },
      {
        headers: { "Content-Type": "application/json" },
        validateStatus: () => true,
      }
    );

    const data = await response.data;

    if (response.status < 200 || response.status >= 300) {
      console.error("Gemini API Error:", data);
      return NextResponse.json(
        { error: data.error?.message || "Failed to generate code" },
        { status: response.status }
      );
    }

    // 5. Extract and Return Content
    let generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      return NextResponse.json(
        { error: "AI generated empty content" },
        { status: 500 }
      );
    }

    // Clean up potential markdown formatting
    generatedText = generatedText.replace(/```json\n?|```/g, "").trim();

    try {
      const parsedContent = JSON.parse(generatedText);

      // Increment usage
      const estimatedTokens =
        (systemPrompt.length + (generatedText?.length || 0)) / 4;
      await incrementUsage(
        userId,
        "code_generator",
        Math.ceil(estimatedTokens)
      );

      return NextResponse.json({ content: parsedContent });
    } catch (e) {
      console.error("JSON Parse Error:", e);
      return NextResponse.json(
        {
          error: "Failed to parse AI response.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in code-generator API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
