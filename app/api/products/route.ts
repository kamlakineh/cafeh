import { NextRequest, NextResponse } from "next/server";
import { dbSelectProducts, dbInsertProduct } from "@/lib/db";
import { uploadBase64ToUploadthing } from "@/lib/upload";
import type { Product } from "@/src/types";

export async function GET() {
  try {
    const products = await dbSelectProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let imageUrl = body.image || "";
    if (imageUrl.startsWith("data:image")) {
      imageUrl = await uploadBase64ToUploadthing(
        imageUrl,
        `product-${Date.now()}.jpg`,
      );
    }
    const newProduct: Product = {
      id: body.id || `prod-${Date.now()}`,
      name: body.name || "",
      description: body.description || "",
      category: body.category || "Burgers",
      price: body.price || 0,
      originalPrice: body.originalPrice,
      rating: body.rating || 5.0,
      reviewsCount: body.reviewsCount || 0,
      prepTime: body.prepTime || "",
      calories: body.calories || "",
      image: imageUrl,
      badge: body.badge,
      ingredients: body.ingredients || [],
      allergens: body.allergens || [],
      spiceLevel: body.spiceLevel,
      isAvailable: body.isAvailable ?? true,
      addOns: body.addOns,
    };
    await dbInsertProduct(newProduct);
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}
