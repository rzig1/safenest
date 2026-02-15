import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";
import { hardFilter, compatibilityScore } from "@/app/lib/matching";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { familyProfile: true },
  });

  if (!user || user.role !== "FAMILY") return Response.json({ error: "Forbidden" }, { status: 403 });
  if (user.verification !== "VERIFIED") return Response.json({ error: "Not verified" }, { status: 403 });

  const children = await prisma.child.findMany({
    where: { status: "AVAILABLE" },
    take: 50,
  });

  const fp = user.familyProfile;
  if (!fp) return Response.json({ error: "Missing family profile" }, { status: 400 });

  const suggestions = children
    .filter(c => hardFilter(c, fp))
    .map(c => {
      const { score, reasons } = compatibilityScore(c, fp);
      return { childId: c.id, city: c.city, ageMin: c.ageMin, ageMax: c.ageMax, score, reasons };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return Response.json({ suggestions });
}
