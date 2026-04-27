import axios from "axios";
import logger from "@/lib/logger";

export async function fetchAndExtractPdfText(url: string) {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data);

    // Dynamically import to avoid Turbopack/Next.js build-time issues with binary dependencies
    const pdf = (await import("pdf-parse-fork")).default;
    const data = await pdf(buffer);
    return data.text || "";
  } catch (error) {
    logger.error({ err: error, url }, "Error extracting PDF text");
    throw error;
  }
}
