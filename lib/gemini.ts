import { GoogleGenAI } from "@google/genai";

let genAiClient: GoogleGenAI | null = null;

export const GEMINI_MODEL = "gemini-2.0-flash";

export function getGenAI(): GoogleGenAI | null {
  if (!genAiClient) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.warn(
        "⚠️ GEMINI_API_KEY is not defined in environment variables.",
      );
      return null;
    }
    try {
      genAiClient = new GoogleGenAI({ apiKey });
    } catch (err) {
      console.error("⚠️ Failed to initialize GoogleGenAI client:", err);
      genAiClient = null;
    }
  }
  return genAiClient;
}
