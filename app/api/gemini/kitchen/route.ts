import { NextRequest, NextResponse } from "next/server";
import { getGenAI, GEMINI_MODEL } from "@/lib/gemini";
import { dbSelectOrders } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, orderId } = body;
    if (!action || !orderId) {
      return NextResponse.json(
        { error: "action and orderId are required" },
        { status: 400 },
      );
    }
    const orders = await dbSelectOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const genAI = getGenAI();
    if (!genAI) {
      return NextResponse.json(
        { error: "Kitchen AI unavailable" },
        { status: 503 },
      );
    }
    const prompt = `You are a kitchen coordinator AI for Aura Café, a luxury dining establishment.
Your role is to help kitchen staff with order preparation guidance, timing estimates, and plating suggestions.

ACTION REQUESTED: ${action}

ORDER DETAILS:
${JSON.stringify(order, null, 2)}

Provide a concise, practical response for the kitchen team.`;
    const result = await genAI.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });
    const reply = result.text;
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("POST /api/gemini/kitchen error:", error);
    return NextResponse.json(
      { error: "Kitchen AI unavailable" },
      { status: 500 },
    );
  }
}
