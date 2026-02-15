import { prisma } from "@/app/lib/prisma";
import { getSession } from "@/app/lib/auth";

export async function requireUser() {
  const session = await getSession();
  if (!session?.user?.email) throw new Error("UNAUTHORIZED");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("UNAUTHORIZED");
  if (user.status !== "ACTIVE") throw new Error("LOCKED");
  return user;
}

export async function requireRole(roles = []) {
  const user = await requireUser();
  if (!roles.includes(user.role)) throw new Error("FORBIDDEN");
  return user;
}

export async function requireVerifiedFamily() {
  const user = await requireRole(["FAMILY"]);
  if (user.verification !== "VERIFIED") throw new Error("NOT_VERIFIED");
  return user;
}
