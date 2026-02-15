const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@safenest.local";
  const cwEmail = "caseworker@safenest.local";
  const pass = await bcrypt.hash("Password123!", 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, passwordHash: pass, role: "ADMIN", verification: "VERIFIED" },
  });

  await prisma.user.upsert({
    where: { email: cwEmail },
    update: {},
    create: { email: cwEmail, passwordHash: pass, role: "CASEWORKER", verification: "VERIFIED" },
  });

  console.log("Seeded admin + caseworker");
}

main().finally(() => prisma.$disconnect());
