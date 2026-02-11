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
        { status: 401 },
      );
    }

    // --- NEW: CHECK USAGE ---
    const userId = session.user.id;
    const usageCheck = await checkUsage(userId, "title_generator");
    if (!usageCheck.allowed) {
      return NextResponse.json(
        { error: usageCheck.message },
        { status: 403 }, // Forbidden
      );
    }

    // 2. Input Validation
    const body = await req.json();
    const { topic, tone, category } = body;

    if (!topic || typeof topic !== "string") {
      return NextResponse.json(
        { error: "Topic is required and must be a string" },
        { status: 400 },
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server configuration error: API key missing" },
        { status: 500 },
      );
    }

    // 3. Prompt Construction
    const prompt = `
      Act as a professional copywriter and viral marketing expert.
      
      Task: Generate 10 high-converting, engaging titles for the following content.
      
      Configuration:
      - Topic: "${topic}"
      - Category: "${category || "General"}"
      - Tone: "${tone || "catchy"}"
      
      Guidelines based on Tone:
      - Catchy & Viral: Use power words, numbers, and curiosity gaps.
      - Professional: Clear, concise, and authoritative.
      - SEO Optimized: Include the keyword naturally, keep under 60 chars if possible.
      - Question Based: Start with How, Why, What, etc.
      - Dramatic: Use strong emotional triggers.

      You must return a valid JSON object with the following structure:
      {
        "titles": [
          {
            "title": "The generated title",
            "score": 85, // A viral potential score from 0-100
            "tags": ["Curiosity", "SEO"], // 2-3 short tags describing the style
            "reasoning": "Brief explanation of why this works"
          }
        ]
      }

      Ensure the JSON is valid. Do not include markdown formatting (like \`\`\`json) around the output, just the raw JSON string.
    `;

    // 4. Call Gemini API
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          maxOutputTokens: 2000,
        },
      },
      {
        headers: { "Content-Type": "application/json" },
        validateStatus: () => true,
      },
    );

    const data = await response.data;

    if (response.status < 200 || response.status >= 300) {
      console.error("Gemini API Error:", data);
      await incrementUsage(userId, "title_generator", 0, "fail");
      return NextResponse.json(
        { error: data.error?.message || "Failed to generate titles" },
        { status: response.status },
      );
    }

    // 5. Extract and Return Content
    let generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      await incrementUsage(userId, "title_generator", 0, "fail");
      return NextResponse.json(
        { error: "AI generated empty content" },
        { status: 500 },
      );
    }

    // Clean up potential markdown formatting
    generatedText = generatedText.replace(/```json\n?|```/g, "").trim();

    try {
      const parsedContent = JSON.parse(generatedText);

      if (!parsedContent.titles || !Array.isArray(parsedContent.titles)) {
        await incrementUsage(userId, "title_generator", 0, "fail");
        return NextResponse.json(
          { error: "Invalid response format from AI" },
          { status: 500 },
        );
      }
      const estimatedTokens =
        (prompt.length + (generatedText?.length || 0)) / 4;
      await incrementUsage(
        userId,
        "title_generator",
        Math.ceil(estimatedTokens),
        "success",
      );

      return NextResponse.json({ titles: parsedContent.titles });
    } catch (e) {
      console.error("JSON Parse Error:", e);
      await incrementUsage(userId, "title_generator", 0, "fail");
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error in title-generator API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
