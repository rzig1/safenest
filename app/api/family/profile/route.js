import { prisma } from "@/app/lib/prisma";
import { requireRole } from "@/app/lib/guards";

export async function POST(req) {
  try {
    const user = await requireRole(["FAMILY"]);
    const body = await req.json();

    const {
      fullName,
      city,
      householdSize,
      incomeRange,
      experience,
      preferences,
    } = body;

    if (!fullName || !city || !householdSize || !incomeRange || !preferences) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const profile = await prisma.familyProfile.upsert({
      where: { userId: user.id },
      update: { fullName, city, householdSize: Number(householdSize), incomeRange, experience: experience || null, preferences },
      create: { userId: user.id, fullName, city, householdSize: Number(householdSize), incomeRange, experience: experience || null, preferences },
    });

    return Response.json({ profile });
  } catch (e) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function GET() {
  try {
    const user = await requireRole(["FAMILY"]);
    const profile = await prisma.familyProfile.findUnique({ where: { userId: user.id } });
    return Response.json({ profile });
  } catch {
    return Response.json({ profile: null });
  }
}
