import { NextRequest, NextResponse } from "next/server";
import { dbSelectEmployees } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, pin } = body;
    if (!pin) {
      return NextResponse.json({ error: "PIN is required" }, { status: 400 });
    }
    const allEmps = await dbSelectEmployees();
    const employee = allEmps.find(
      (e) => e.pin === pin && e.isAccessEnabled && (!id || e.id === id),
    );
    if (!employee) {
      return NextResponse.json(
        { error: "Invalid PIN or access disabled" },
        { status: 401 },
      );
    }
    const { password, ...safe } = employee;
    return NextResponse.json({ employee: { ...safe, pin: "****" } });
  } catch (error) {
    console.error("POST /api/employees/verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
