export async function POST(req, ctx) {
  const session = await getServerSession(authOptions);
  const me = session?.user;

  if (!me || me.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await ctx.params;

  if (!userId) {
    return Response.json({ error: "Missing userId" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { status: "BANNED" },
  });

  return Response.json({ ok: true });
}
