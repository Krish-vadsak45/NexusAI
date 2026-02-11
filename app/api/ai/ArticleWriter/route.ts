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
    const usageCheck = await checkUsage(userId, "article_writer");
    if (!usageCheck.allowed) {
      return NextResponse.json(
        { error: usageCheck.message },
        { status: 403 }, // Forbidden
      );
    }

    // 2. Input Validation
    const body = await req.json();
    const { topic, keywords, tone, length, language } = body;

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
    let lengthPrompt = "medium length (approx 1000 words)";
    if (length === "short") lengthPrompt = "short length (approx 500 words)";
    if (length === "long") lengthPrompt = "long length (approx 2000+ words)";

    const prompt = `
      Act as a professional content marketing expert.
      
      Task: Generate a comprehensive content package for the topic: "${topic}".
      
      Configuration:
      - Keywords: ${keywords || "None provided"}
      - Tone: ${tone || "professional"}
      - Length: ${lengthPrompt}
      - Language: ${language || "english"}
      
      You must return a valid JSON object with the following structure:
      {
        "article": "The full article content in Markdown format (headings, bold, lists, etc).",
        "seo": {
          "title": "SEO optimized title (max 60 chars)",
          "description": "SEO meta description (max 160 chars)",
          "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
        },
        "social": {
          "twitter": "A thread of 3-5 tweets promoting this article. Use emojis.",
          "linkedin": "A professional LinkedIn post promoting this article. Use hashtags."
        },
        "summary": "3-5 bullet points summarizing the key takeaways."
      }

      Ensure the JSON is valid and strictly follows this structure. 
      IMPORTANT: Ensure all strings are properly escaped, especially double quotes within the article content. 
      Do not include markdown formatting (like \`\`\`json) around the output, just the raw JSON string.
    `;

    // 4. Call Gemini API
    // Using gemini-2.0-flash for better stability with JSON mode
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          maxOutputTokens: 8192, // Increased token limit for long articles
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
      await incrementUsage(userId, "article_writer", 0, "fail");
      return NextResponse.json(
        { error: data.error?.message || "Failed to generate content" },
        { status: response.status },
      );
    }

    // 5. Extract and Return Content
    let generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      await incrementUsage(userId, "article_writer", 0, "fail");
      return NextResponse.json(
        { error: "AI generated empty content" },
        { status: 500 },
      );
    }

    // Clean up potential markdown formatting
    generatedText = generatedText.replace(/```json\n?|```/g, "").trim();

    // Parse JSON to ensure it's valid before sending
    try {
      const parsedContent = JSON.parse(generatedText);
      console.log("Parsed Content:", parsedContent);
      const estimatedTokens =
        (prompt.length + (generatedText?.length || 0)) / 4;
      await incrementUsage(
        userId,
        "article_writer",
        Math.ceil(estimatedTokens),
        "success",
      );
      return NextResponse.json({ content: parsedContent });
    } catch (e) {
      console.error("JSON Parse Error:", e);
      console.log("Raw Generated Text:", generatedText); // Log for debugging
      await incrementUsage(userId, "article_writer", 0, "fail");
      return NextResponse.json(
        {
          error:
            "Failed to parse AI response. The content might be too long or malformed.",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error in article-writer API:", error);
    // Note: We don't have userId if session check failed, but we handle that above
    // If it fails here, it's likely a serious server error
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
