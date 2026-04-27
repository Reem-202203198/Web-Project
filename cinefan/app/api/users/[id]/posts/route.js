import { NextResponse } from "next/server";
import { getPostsByUser } from "@/lib/repository";

// GET /api/users/[id]/posts
// Returns all posts by a specific user (for their profile page)
export async function GET(request, { params }) {
  try {
    const posts = await getPostsByUser(params.id);
    return NextResponse.json(posts);
  } catch (error) {
    console.error("GET /api/users/[id]/posts error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}