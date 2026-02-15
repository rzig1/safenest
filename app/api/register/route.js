import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req) {
  const body = await req.json();
  const email = (body.email || "").toLowerCase().trim();
  const password = body.password || "";

  if (!email || password.length < 8) {
    return Response.json({ error: "Invalid email or password too short." }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return Response.json({ error: "Email already exists." }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { email, passwordHash, role: "FAMILY" },
    select: { id: true, email: true },
  });

  return Response.json({ user });
}
