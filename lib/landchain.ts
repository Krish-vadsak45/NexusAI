import axios from "axios";

export async function fetchAndExtractPdfText(url: string) {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data);

    // Dynamically import to avoid Turbopack/Next.js build-time issues with binary dependencies
    const pdf = (await import("pdf-parse-fork")).default;
    // @ts-ignore
    const data = await pdf(buffer);
    return data.text || "";
  } catch (error) {
    console.error("Error extracting PDF text:", error);
    throw error;
  }
}
