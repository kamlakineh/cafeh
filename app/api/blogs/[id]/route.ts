import { NextRequest, NextResponse } from "next/server";
import { dbSelectBlogs, dbSaveBlog } from "@/lib/db";
import { uploadBase64ToUploadthing } from "@/lib/upload";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const allBlogs = await dbSelectBlogs();
    const existing = allBlogs.find((b) => b.id === id);
    if (!existing) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }
    let imageUrl = body.image ?? existing.image;
    if (imageUrl && imageUrl.startsWith("data:image")) {
      imageUrl = await uploadBase64ToUploadthing(imageUrl, `blog-${id}.jpg`);
    }
    const updated = { ...existing, ...body, id, image: imageUrl };
    await dbSaveBlog(updated);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/blogs/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update blog" },
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
      await db`DELETE FROM blogs WHERE id = ${id}`;
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/blogs/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete blog" },
      { status: 500 },
    );
  }
}
