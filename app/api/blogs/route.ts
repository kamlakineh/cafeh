import { NextRequest, NextResponse } from "next/server";
import { dbSelectBlogs, dbSaveBlog } from "@/lib/db";
import { uploadBase64ToUploadthing } from "@/lib/upload";
import type { BlogPost } from "@/src/types";

export async function GET() {
  try {
    const blogs = await dbSelectBlogs();
    return NextResponse.json(blogs);
  } catch (error) {
    console.error("GET /api/blogs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
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
        `blog-${Date.now()}.jpg`,
      );
    }
    const newBlog: BlogPost = {
      id: body.id || `blog-${Date.now()}`,
      title: body.title || "",
      category: body.category || "General",
      excerpt: body.excerpt || "",
      content: body.content || "",
      image: imageUrl,
      authorName: body.authorName || "Aura Café",
      authorAvatar: body.authorAvatar || "",
      date:
        body.date ||
        new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
      readTime: body.readTime || "5 min read",
      tags: body.tags || [],
    };
    await dbSaveBlog(newBlog);
    return NextResponse.json(newBlog, { status: 201 });
  } catch (error) {
    console.error("POST /api/blogs error:", error);
    return NextResponse.json(
      { error: "Failed to create blog" },
      { status: 500 },
    );
  }
}
