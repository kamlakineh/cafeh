import { NextRequest, NextResponse } from "next/server";
import { dbSelectInventory, dbSaveInventory } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ oldItemName: string }> },
) {
  try {
    const { oldItemName } = await params;
    const body = await req.json();
    const allInv = await dbSelectInventory();
    const existing = allInv.find((i) => i.item === oldItemName);
    if (!existing) {
      return NextResponse.json(
        { error: "Inventory item not found" },
        { status: 404 },
      );
    }
    const updated = {
      item: body.item ?? existing.item,
      current: body.current ?? existing.current,
      min: body.min ?? existing.min,
      status: body.status ?? existing.status,
    };
    const db = (await import("@/lib/db")).getDb();
    if (db) {
      await db`DELETE FROM inventory WHERE item = ${oldItemName}`;
    }
    await dbSaveInventory(updated);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/inventory/[oldItemName] error:", error);
    return NextResponse.json(
      { error: "Failed to update inventory item" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ oldItemName: string }> },
) {
  try {
    const { oldItemName } = await params;
    const db = (await import("@/lib/db")).getDb();
    if (db) {
      await db`DELETE FROM inventory WHERE item = ${oldItemName}`;
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/inventory/[oldItemName] error:", error);
    return NextResponse.json(
      { error: "Failed to delete inventory item" },
      { status: 500 },
    );
  }
}
