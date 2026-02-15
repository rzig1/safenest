import { prisma } from "@/app/lib/prisma";
import { requireRole } from "@/app/lib/guards";

export async function GET() {
  try {
    await requireRole(["ADMIN"]);
    const users = await prisma.user.findMany({
      where: { role: "FAMILY" },
      include: { documents: true, familyProfile: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return Response.json({ users });
  } catch {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
}
