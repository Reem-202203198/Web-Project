import { createUser, getUserByEmail } from "@/lib/repository";

export async function POST(request) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return Response.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return Response.json(
        { error: "Email already registered" },
        { status: 400 },
      );
    }

    const user = await createUser({ username, email, password });
    return Response.json(user, { status: 201 });
  } catch (error) {
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
