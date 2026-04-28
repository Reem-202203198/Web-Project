import { getUserByEmail } from "@/lib/repository";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json(
        { error: "Email and password required" },
        { status: 400 },
      );
    }

    const user = await getUserByEmail(email);
    if (!user || user.password !== password) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    return Response.json(user);
  } catch (error) {
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
