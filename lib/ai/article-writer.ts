import axios from "axios";
import type { ArticleWriterContent, ArticleWriterRequest } from "@/lib/api/contracts";

export function buildArticleWriterPrompt(input: ArticleWriterRequest) {
  let lengthPrompt = "medium length (approx 1000 words)";
  if (input.length === "short") lengthPrompt = "short length (approx 500 words)";
  if (input.length === "long") lengthPrompt = "long length (approx 2000+ words)";

  return `
      Act as a professional content marketing expert.
      
      Task: Generate a comprehensive content package for the topic: "${input.topic}".
      
      Configuration:
      - Keywords: ${input.keywords || "None provided"}
      - Tone: ${input.tone || "professional"}
      - Length: ${lengthPrompt}
      - Language: ${input.language || "english"}
      
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
}

export async function generateArticleWriterContent(
  input: ArticleWriterRequest,
): Promise<{
  content: ArticleWriterContent;
  metrics: { estimatedTokens: number; promptTokens: number; completionTokens: number };
}> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Server configuration error: API key missing");
  }

  const prompt = buildArticleWriterPrompt(input);
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 8192,
      },
    },
    {
      headers: { "Content-Type": "application/json" },
      validateStatus: () => true,
    },
  );

  const data = await response.data;
  if (response.status < 200 || response.status >= 300) {
    throw new Error(data.error?.message || "Failed to generate content");
  }

  let generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!generatedText) {
    throw new Error("AI generated empty content");
  }

  generatedText = generatedText.replace(/```json\n?|```/g, "").trim();
  const parsedContent = JSON.parse(generatedText) as ArticleWriterContent;
  const promptTokens = Math.ceil(prompt.length / 4);
  const completionTokens = Math.ceil(generatedText.length / 4);

  return {
    content: parsedContent,
    metrics: {
      estimatedTokens: promptTokens + completionTokens,
      promptTokens,
      completionTokens,
    },
  };
}
