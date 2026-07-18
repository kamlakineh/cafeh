import { NextRequest, NextResponse } from "next/server";
import { dbSelectOrders, dbSaveOrder } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const allOrders = await dbSelectOrders();
    const orderIndex = allOrders.findIndex((o) => o.id === id);
    if (orderIndex === -1) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const updated = { ...allOrders[orderIndex], ...body, id };
    await dbSaveOrder(updated);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/orders/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 },
    );
  }
}
