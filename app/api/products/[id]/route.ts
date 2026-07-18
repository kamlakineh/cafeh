import { NextRequest, NextResponse } from "next/server";
import { dbSelectProducts, dbInsertProduct } from "@/lib/db";
import { uploadBase64ToUploadthing } from "@/lib/upload";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const allProducts = await dbSelectProducts();
    const existing = allProducts.find((p) => p.id === id);
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    let imageUrl = body.image ?? existing.image;
    if (imageUrl && imageUrl.startsWith("data:image")) {
      imageUrl = await uploadBase64ToUploadthing(imageUrl, `product-${id}.jpg`);
    }
    const updated = { ...existing, ...body, id, image: imageUrl };
    await dbInsertProduct(updated);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/products/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
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
      await db`DELETE FROM products WHERE id = ${id}`;
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
