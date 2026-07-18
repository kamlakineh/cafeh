import { NextRequest, NextResponse } from "next/server";
import { getGenAI, GEMINI_MODEL } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message } = body;
    if (!message) {
      return NextResponse.json(
        { error: "message is required" },
        { status: 400 },
      );
    }
    const genAI = getGenAI();
    if (!genAI) {
      return NextResponse.json(
        { error: "AI concierge unavailable" },
        { status: 503 },
      );
    }
    const prompt = `You are a warm, knowledgeable restaurant concierge for Aura Café, a luxury dining establishment. 
You help guests with menu inquiries, dietary questions, reservations, and general hospitality.
Be concise, charming, and helpful. Never recommend competitors.

Guest message: ${message}`;
    const result = await genAI.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });
    const reply = result.text;
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("POST /api/gemini/chat error:", error);
    return NextResponse.json(
      { error: "AI concierge unavailable" },
      { status: 500 },
    );
  }
}
