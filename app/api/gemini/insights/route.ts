import { NextRequest, NextResponse } from "next/server";
import { getGenAI, GEMINI_MODEL } from "@/lib/gemini";
import {
  dbSelectOrders,
  dbSelectProducts,
  dbSelectInventory,
  dbSelectEmployees,
} from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body;
    if (!query) {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }
    const [orders, products, inventory, employees] = await Promise.all([
      dbSelectOrders(),
      dbSelectProducts(),
      dbSelectInventory(),
      dbSelectEmployees(),
    ]);
    const sanitizedEmployees = employees.map(({ password, ...e }) => ({
      ...e,
      pin: "****",
    }));
    const context = JSON.stringify({
      orders,
      products,
      inventory,
      employees: sanitizedEmployees,
    });
    const genAI = getGenAI();
    if (!genAI) {
      return NextResponse.json(
        { error: "AI insights unavailable" },
        { status: 503 },
      );
    }
    const prompt = `You are a business intelligence analyst for Aura Café, a luxury dining establishment.
Analyze the following real-time restaurant data and answer the owner's query with actionable insights.
Be data-driven, concise, and strategic. Suggest concrete improvements when relevant.

RESTAURANT DATA:
${context}

OWNER QUERY: ${query}`;
    const result = await genAI.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });
    const reply = result.text;
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("POST /api/gemini/insights error:", error);
    return NextResponse.json(
      { error: "AI insights unavailable" },
      { status: 500 },
    );
  }
}
