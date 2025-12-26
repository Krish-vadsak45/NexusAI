import { auth } from "@/lib/auth";
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Input Validation
    const body = await req.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // 3. Construct System Prompt
    const systemPrompt = `
      Act as an expert AI image prompt engineer.
      Your task is to take a simple user prompt and enhance it to generate a high-quality, detailed, and artistic image.
      
      User Prompt: "${prompt}"
      
      Guidelines:
      - Add descriptive details about lighting, texture, composition, and style.
      - Keep it concise but potent (under 100 words).
      - Do not add conversational text, just return the enhanced prompt string.
      - If the prompt is already detailed, just refine it slightly.
    `;

    // 4. Call Gemini API
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: systemPrompt }] }],
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const enhancedPrompt =
      response.data.candidates[0].content.parts[0].text.trim();

    return NextResponse.json({ enhancedPrompt });
  } catch (error) {
    console.error("Prompt Enhancement Error:", error);
    return NextResponse.json(
      { error: "Failed to enhance prompt" },
      { status: 500 }
    );
  }
}
