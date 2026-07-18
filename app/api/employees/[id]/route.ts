import { NextRequest, NextResponse } from "next/server";
import { dbSelectEmployees, dbSaveEmployee } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const allEmps = await dbSelectEmployees();
    const existing = allEmps.find((e) => e.id === id);
    if (!existing) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 },
      );
    }
    const updated = { ...existing, ...body, id };
    await dbSaveEmployee(updated);
    const { password, ...safe } = updated;
    return NextResponse.json({ ...safe, pin: safe.pin ? "****" : undefined });
  } catch (error) {
    console.error("PATCH /api/employees/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update employee" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const db = (await import("@/lib/db")).getDb();
    if (db) {
      await db`DELETE FROM employees WHERE id = ${id}`;
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/employees/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete employee" },
      { status: 500 },
    );
  }
}
