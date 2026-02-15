import { prisma } from "@/app/lib/prisma";
import { requireRole } from "@/app/lib/guards";

export async function GET() {
  try {
    const user = await requireRole(["FAMILY"]);
    const docs = await prisma.document.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
    return Response.json({ verification: user.verification, docs });
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req) {
  try {
    const user = await requireRole(["FAMILY"]);
    const body = await req.json();
    const { type, url } = body;

    if (!type || !url) return Response.json({ error: "type and url required" }, { status: 400 });

    const doc = await prisma.document.create({
      data: { userId: user.id, type, url, status: "UPLOADED" },
    });

    // move family into pending review once they submit any docs
    if (user.verification === "UNVERIFIED") {
      await prisma.user.update({ where: { id: user.id }, data: { verification: "PENDING_REVIEW" } });
    }

    return Response.json({ doc });
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}
