import { auth } from "@/lib/auth";
import {
  checkAndIncrementUsage,
  revertFeatureUsage,
  recordUsageResult,
} from "@/middleware/usage";
import axios from "axios";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getErrorMessage } from "@/lib/error-utils";
import logger from "@/lib/logger";

export async function POST(req: Request) {
  let session;
  try {
    // 1. Authentication
    session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Usage Check (Atomic Check & Increment)
    const usageCheck = await checkAndIncrementUsage(
      session.user.id,
      "video_repurposer",
    );

    if (!usageCheck.allowed) {
      return NextResponse.json({ error: usageCheck.message }, { status: 403 });
    }

    const body = await req.json();
    const { title, context, tone, videoUrl } = body;

    if (!title || !videoUrl) {
      return NextResponse.json(
        { error: "Video title and URL are required" },
        { status: 400 },
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    let fileUri = null;

    // 3. Handle Video Upload (if provided)
    if (videoUrl) {
      try {
        // Download video from Cloudinary
        const videoResponse = await axios.get(videoUrl, {
          responseType: "arraybuffer",
        });
        const videoBuffer = Buffer.from(videoResponse.data);

        // Upload to Google AI File API
        // Step 1: Initiate Upload
        const uploadInitResponse = await axios.post(
          `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`,
          { file: { display_name: title } },
          {
            headers: {
              "X-Goog-Upload-Protocol": "resumable",
              "X-Goog-Upload-Command": "start",
              "X-Goog-Upload-Header-Content-Length": videoBuffer.length,
              "X-Goog-Upload-Header-Content-Type": "video/mp4", // Assuming MP4 for now
              "Content-Type": "application/json",
            },
          },
        );

        const uploadUrl = uploadInitResponse.headers["x-goog-upload-url"];

        // Step 2: Upload Bytes
        const uploadFileResponse = await axios.post(uploadUrl, videoBuffer, {
          headers: {
            "Content-Length": videoBuffer.length,
            "X-Goog-Upload-Offset": 0,
            "X-Goog-Upload-Command": "upload, finalize",
          },
        });

        fileUri = uploadFileResponse.data.file.uri;

        // Wait for processing (simple delay, ideally should poll)
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } catch (uploadError) {
        logger.error({ err: uploadError }, "Video upload failed");
        // Fallback to text-only if video fails (or return error)
        // return NextResponse.json({ error: "Failed to process video" }, { status: 500 });
      }
    }
    logger.info({ fileUri }, "Video processing initiated");
    // 4. Generate Content
    const promptText = `
      Act as a professional YouTube Strategist and Social Media Manager.
      
      Input Video Title: "${title}"
      Context/Notes: "${context || "No additional context provided"}"
      Tone: "${tone || "Exciting and Energetic"}"
      ${
        fileUri
          ? "Analyze the attached video to extract key insights, quotes, and summary."
          : ""
      }

      Generate a complete content repurposing package. Return ONLY valid JSON with this structure:
      {
        "titles": ["5 viral title variations"],
        "youtube": {
          "description": "Full YouTube description with a hook, bullet points of content, and hashtags.",
          "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
        },
        "shortsScript": "A 60-second script for TikTok/Reels/Shorts summarizing the main point. Include [Visual Cues].",
        "social": {
          "twitter": "A thread of 3-5 tweets. Use emojis.",
          "linkedin": "A professional LinkedIn post."
        }
      }
    `;

    const contentsPart = [{ text: promptText }];
    if (fileUri) {
      contentsPart.push({
        // @ts-expect-error Gemini file parts are broader than the inferred literal type here.
        file_data: { mime_type: "video/mp4", file_uri: fileUri },
      });
    }

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        contents: [{ parts: contentsPart }],
        generationConfig: { responseMimeType: "application/json" },
      },
      { headers: { "Content-Type": "application/json" } },
    );

    let generatedText =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error("AI generated empty content");
    }

    // Clean up potential markdown formatting
    generatedText = generatedText.replace(/```json\n?|```/g, "").trim();

    let parsedContent;
    try {
      parsedContent = JSON.parse(generatedText);
    } catch (parseError) {
      logger.error(
        { err: parseError, generatedText },
        "JSON Parse Error during video repurpose",
      );
      // Revert usage on parse failure
      await revertFeatureUsage(session.user.id, "video_repurposer");
      await recordUsageResult(session.user.id, "video_repurposer", 0, "fail");
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 },
      );
    }

    // Record usage success and tokens (assuming 1 token for now as per original code)
    await recordUsageResult(session.user.id, "video_repurposer", 1, "success");

    return NextResponse.json({ content: parsedContent });
  } catch (error: unknown) {
    logger.error({ err: error }, "Video Repurposer Error");
    return NextResponse.json(
      { error: getErrorMessage(error, "Internal Server Error") },
      { status: 500 },
    );
  }
}
