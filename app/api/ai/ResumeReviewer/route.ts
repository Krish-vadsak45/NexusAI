import { auth } from "@/lib/auth";
import { checkUsage, incrementUsage } from "@/middleware/usage";
import axios from "axios";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { fetchAndExtractPdfText } from "@/lib/landchain";

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

    // 2. Usage Check (Optional - uncomment if needed)
    const userId = session.user.id;
    const usageCheck = await checkUsage(userId, "resume_reviewer");
    if (!usageCheck.allowed) {
      return NextResponse.json({ error: usageCheck.message }, { status: 403 });
    }

    // 3. Input Parsing
    const body = await req.json();
    const { fileUrl, jobDescription, fileType } = body;

    if (!fileUrl) {
      return NextResponse.json(
        { error: "File URL is required" },
        { status: 400 }
      );
    }

    // 4. Text Extraction
    let resumeText = "";

    // Try LangChain for PDFs first if fileType matches or is unknown
    if (!fileType || fileType === "application/pdf") {
      try {
        // resumeText = await fetchAndExtractPdfText(fileUrl);
        console.log("langchain  ,,,", resumeText);
      } catch (error) {
        console.log("LangChain PDF extraction failed:", error);
      }
    }

    // If no text extracted yet (not a PDF or LangChain failed), try manual methods
    if (!resumeText) {
      // Fetch the file from the URL
      const fileResponse = await axios.get(fileUrl, {
        responseType: "arraybuffer",
      });
      const buffer = Buffer.from(fileResponse.data);
      const contentType = fileResponse.headers["content-type"] || fileType;

      if (
        contentType ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        contentType === "application/msword"
      ) {
        const result = await mammoth.extractRawText({ buffer });
        resumeText = result.value;
      } else if (contentType === "text/plain") {
        resumeText = buffer.toString("utf-8");
      } else {
        // Fallback for other types or if content-type is missing but we know it's a resume
        // Try to parse as text first
        try {
          resumeText = buffer.toString("utf-8");
        } catch (e) {
          return NextResponse.json(
            { error: "Unsupported file type" },
            { status: 400 }
          );
        }
      }
    }

    if (!resumeText.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from the file" },
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

    // 5. Prompt Construction
    const prompt = `
      You are an expert Resume Reviewer and Career Coach.
      Analyze the following resume text and provide a detailed review.
      
      ${
        jobDescription
          ? `Target Job Description:
      "${jobDescription}"
      
      Evaluate the resume specifically on how well it matches this job description.`
          : "Evaluate the resume for general best practices, impact, and clarity."
      }
      
      Resume Text:
      "${resumeText.slice(
        0,
        20000
      )}" // Limit text length to avoid token limits if necessary
      
      Return the result in the following JSON format:
      {
        "score": number, // 0-100
        "summary": "string", // A brief summary of the review
        "strengths": ["string", "string", ...], // List of 3-5 strengths
        "weaknesses": ["string", "string", ...], // List of 3-5 weaknesses
        "improvements": ["string", "string", ...] // List of 3-5 specific actionable improvements
      }
    `;

    // 6. Call Gemini API
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
        },
      },
      {
        headers: { "Content-Type": "application/json" },
        validateStatus: () => true,
      }
    );

    if (response.status !== 200) {
      console.error("Gemini API Error:", response.data);
      return NextResponse.json(
        { error: "Failed to analyze resume" },
        { status: 500 }
      );
    }

    const generatedText =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      return NextResponse.json(
        { error: "No analysis generated" },
        { status: 500 }
      );
    }

    let analysisResult;
    try {
      analysisResult = JSON.parse(generatedText);
    } catch (e) {
      console.error("JSON Parse Error:", e);
      return NextResponse.json(
        { error: "Failed to parse analysis result" },
        { status: 500 }
      );
    }

    // 7. Increment Usage (Optional)
    await incrementUsage(userId, "resume_reviewer", 1);

    return NextResponse.json(analysisResult);
  } catch (error: any) {
    console.error("Resume Reviewer Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
