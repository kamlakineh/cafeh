import { NextResponse } from "next/server";
import { dbSelectFAQs } from "@/lib/db";

export async function GET() {
  try {
    const faqs = await dbSelectFAQs();
    return NextResponse.json(faqs);
  } catch (error) {
    console.error("GET /api/faqs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch FAQs" },
      { status: 500 },
    );
  }
}
