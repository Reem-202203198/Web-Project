import { NextResponse } from "next/server";
import { getUserById, updateUserProfile } from "@/lib/repository";

// GET /api/users/[id]
// Returns a user's profile by their ID
export async function GET(request, { params }) {
  try {
    const user = await getUserById(params.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("GET /api/users/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/users/[id]
// Updates a user's profile (username, bio, profilePicture)
// Body: { username?, bio?, profilePicture? }
export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const { username, bio, profilePicture } = body;

    // Make sure at least one field is provided
    if (!username && bio === undefined && profilePicture === undefined) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const updatedUser = await updateUserProfile(params.id, {
      username,
      bio,
      profilePicture,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    // Handle unique constraint error (username already taken)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 }
      );
    }
    // Handle user not found
    if (error.code === "P2025") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.error("PUT /api/users/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}