import { NextRequest, NextResponse } from "next/server";
import { dbSelectReviews } from "@/lib/db";
import type { Review } from "@/src/types";

export async function GET() {
  try {
    const revs = await dbSelectReviews();
    return NextResponse.json(revs);
  } catch (error) {
    console.error("GET /api/reviews error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = (await import("@/lib/db")).getDb();
    const newReview: Review = {
      id: 0,
      name: body.name || "Anonymous",
      avatar: body.avatar || "",
      rating: body.rating || 5,
      text: body.text || "",
      date:
        body.date ||
        new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
    };
    if (db) {
      const result = await db`
        INSERT INTO reviews (name, avatar, rating, text, date)
        VALUES (${newReview.name}, ${newReview.avatar}, ${newReview.rating}, ${newReview.text}, ${newReview.date})
        RETURNING id
      `;
      newReview.id = result[0].id;
    }
    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error("POST /api/reviews error:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 },
    );
  }
}
