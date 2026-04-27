import { NextResponse } from "next/server";
import {
  getFollowers,
  getFollowing,
  followUser,
  unfollowUser,
  isFollowing,
} from "@/lib/repository";

// GET /api/users/[id]/follow
// Returns followers and following lists for a user
// Query param: ?type=followers OR ?type=following
export async function GET(request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "followers" or "following"

    if (type === "followers") {
      const followers = await getFollowers(params.id);
      return NextResponse.json(followers);
    }

    if (type === "following") {
      const following = await getFollowing(params.id);
      return NextResponse.json(following);
    }

    // If no type, return both
    const [followers, following] = await Promise.all([
      getFollowers(params.id),
      getFollowing(params.id),
    ]);

    return NextResponse.json({ followers, following });
  } catch (error) {
    console.error("GET /api/users/[id]/follow error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/users/[id]/follow
// Follow this user
// Body: { followerId: string }
export async function POST(request, { params }) {
  try {
    const body = await request.json();
    const { followerId } = body;

    if (!followerId) {
      return NextResponse.json(
        { error: "followerId is required" },
        { status: 400 }
      );
    }

    // Prevent following yourself
    if (followerId === params.id) {
      return NextResponse.json(
        { error: "You cannot follow yourself" },
        { status: 400 }
      );
    }

    // Check if already following
    const alreadyFollowing = await isFollowing(followerId, params.id);
    if (alreadyFollowing) {
      return NextResponse.json(
        { error: "Already following this user" },
        { status: 409 }
      );
    }

    await followUser(followerId, params.id);
    return NextResponse.json({ message: "Followed successfully" });
  } catch (error) {
    console.error("POST /api/users/[id]/follow error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/users/[id]/follow
// Unfollow this user
// Body: { followerId: string }
export async function DELETE(request, { params }) {
  try {
    const body = await request.json();
    const { followerId } = body;

    if (!followerId) {
      return NextResponse.json(
        { error: "followerId is required" },
        { status: 400 }
      );
    }

    // Check if actually following before trying to unfollow
    const currentlyFollowing = await isFollowing(followerId, params.id);
    if (!currentlyFollowing) {
      return NextResponse.json(
        { error: "You are not following this user" },
        { status: 404 }
      );
    }

    await unfollowUser(followerId, params.id);
    return NextResponse.json({ message: "Unfollowed successfully" });
  } catch (error) {
    console.error("DELETE /api/users/[id]/follow error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}