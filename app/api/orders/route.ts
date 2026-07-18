import { NextRequest, NextResponse } from "next/server";
import { dbSelectOrders, dbSaveOrder } from "@/lib/db";
import type { Order } from "@/src/types";

export async function GET() {
  try {
    const allOrders = await dbSelectOrders();
    return NextResponse.json(allOrders);
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newOrder: Order = {
      id: body.id || `ORD-${Date.now()}`,
      table: body.table || "Dine-In",
      customerName: body.customerName || "Guest",
      type: body.type || "Dine-in",
      status: body.status || "Pending",
      items: body.items || [],
      total: body.total || 0,
      paymentStatus: body.paymentStatus || "Pending",
      paymentMethod: body.paymentMethod || "",
      createdAt: body.createdAt || new Date().toISOString(),
      chef: body.chef,
      notes: body.notes,
      waiter: body.waiter,
      priority: body.priority || false,
      delayReason: body.delayReason,
      timeRemaining: body.timeRemaining,
    };
    await dbSaveOrder(newOrder);
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 },
    );
  }
}
