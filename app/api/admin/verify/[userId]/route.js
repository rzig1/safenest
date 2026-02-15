import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req, ctx) {
  const session = await getServerSession(authOptions);
  const me = session?.user;

  if (!me || me.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // ✅ Next.js 16: params is a Promise
  const { userId } = await ctx.params;

  if (!userId) {
    return Response.json({ error: "Missing userId" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { verification: "VERIFIED" },
  });

  return Response.json({ ok: true });
}
