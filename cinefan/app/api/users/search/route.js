import { searchUsers } from "@/lib/repository";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const users = await searchUsers(q);
    return Response.json(users);
  } catch (error) {
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
