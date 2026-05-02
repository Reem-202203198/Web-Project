import { NextResponse } from "next/server";
import { getFollowers, getFollowing, followUser, unfollowUser, isFollowing } from "@/lib/repository";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    if (type === "followers") return NextResponse.json(await getFollowers(id));
    if (type === "following") return NextResponse.json(await getFollowing(id));
    const [followers, following] = await Promise.all([getFollowers(id), getFollowing(id)]);
    return NextResponse.json({ followers, following });
  } catch (error) {
    console.error("GET /api/users/[id]/follow error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const { followerId } = await request.json();
    if (!followerId) return NextResponse.json({ error: "followerId is required" }, { status: 400 });
    if (followerId === id) return NextResponse.json({ error: "You cannot follow yourself" }, { status: 400 });
    const already = await isFollowing(followerId, id);
    if (already) return NextResponse.json({ error: "Already following" }, { status: 409 });
    await followUser(followerId, id);
    return NextResponse.json({ message: "Followed successfully" });
  } catch (error) {
    console.error("POST /api/users/[id]/follow error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const { followerId } = await request.json();
    if (!followerId) return NextResponse.json({ error: "followerId is required" }, { status: 400 });
    const currently = await isFollowing(followerId, id);
    if (!currently) return NextResponse.json({ error: "Not following" }, { status: 404 });
    await unfollowUser(followerId, id);
    return NextResponse.json({ message: "Unfollowed successfully" });
  } catch (error) {
    console.error("DELETE /api/users/[id]/follow error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}