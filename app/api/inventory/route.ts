import { NextRequest, NextResponse } from "next/server";
import { dbSelectInventory, dbSaveInventory } from "@/lib/db";
import type { InventoryItem } from "@/src/types";

export async function GET() {
  try {
    const inv = await dbSelectInventory();
    return NextResponse.json(inv);
  } catch (error) {
    console.error("GET /api/inventory error:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newItem: InventoryItem = {
      item: body.item,
      current: body.current ?? 0,
      min: body.min ?? 0,
      status: body.status || "OK",
    };
    await dbSaveInventory(newItem);
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("POST /api/inventory error:", error);
    return NextResponse.json(
      { error: "Failed to create inventory item" },
      { status: 500 },
    );
  }
}
