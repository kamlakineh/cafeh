import { NextRequest, NextResponse } from "next/server";
import { dbSelectInventory, dbSaveInventory } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const allInv = await dbSelectInventory();
    const existing = allInv.find((i) => i.item === body.item);
    if (!existing) {
      return NextResponse.json(
        { error: "Inventory item not found" },
        { status: 404 },
      );
    }
    const updated = {
      ...existing,
      current: body.current ?? existing.current,
      min: body.min ?? existing.min,
      status: body.status ?? existing.status,
    };
    await dbSaveInventory(updated);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("POST /api/inventory/update error:", error);
    return NextResponse.json(
      { error: "Failed to update inventory" },
      { status: 500 },
    );
  }
}
