import { NextResponse } from "next/server";
import { dbSelectTeamMembers } from "@/lib/db";

export async function GET() {
  try {
    const team = await dbSelectTeamMembers();
    return NextResponse.json(team);
  } catch (error) {
    console.error("GET /api/team error:", error);
    return NextResponse.json(
      { error: "Failed to fetch team" },
      { status: 500 },
    );
  }
}
