import { NextResponse } from "next/server";
import { getPostsByUser } from "@/lib/repository";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const posts = await getPostsByUser(id);
    return NextResponse.json(posts);
  } catch (error) {
    console.error("GET /api/users/[id]/posts error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}