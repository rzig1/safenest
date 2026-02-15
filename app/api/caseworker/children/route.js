import { prisma } from "@/app/lib/prisma";
import { requireRole } from "@/app/lib/guards";

export async function POST(req) {
  try {
    const user = await requireRole(["CASEWORKER", "ADMIN"]);
    const body = await req.json();

    const { ageMin, ageMax, city, needs, preferences } = body;
    if (!ageMin || !ageMax || !city) {
      return Response.json({ error: "ageMin, ageMax, city required" }, { status: 400 });
    }

    const child = await prisma.child.create({
      data: {
        createdById: user.id,
        ageMin: Number(ageMin),
        ageMax: Number(ageMax),
        city,
        needs: needs || { requiredSupports: [] },
        preferences: preferences || {},
      },
    });

    return Response.json({ child });
  } catch {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
}

export async function GET() {
  try {
    await requireRole(["CASEWORKER", "ADMIN"]);
    const children = await prisma.child.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
    return Response.json({ children });
  } catch {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
}
