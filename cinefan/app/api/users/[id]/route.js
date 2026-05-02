import { NextResponse } from "next/server";
import { getUserById, updateUserProfile } from "@/lib/repository";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const user = await getUserById(id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    console.error("GET /api/users/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { username, bio, profilePicture } = body;
    if (!username && bio === undefined && profilePicture === undefined)
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    const updatedUser = await updateUserProfile(id, { username, bio, profilePicture });
    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error.code === "P2002") return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    if (error.code === "P2025") return NextResponse.json({ error: "User not found" }, { status: 404 });
    console.error("PUT /api/users/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}