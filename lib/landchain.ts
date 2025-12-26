import { Buffer } from "node:buffer";
// @ts-ignore
import pdf from "pdf-parse";

export async function fetchAndExtractPdfText(url: string) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const data = await pdf(buffer);
  return data.text;
}
