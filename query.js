const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const logs = await prisma.shipmentLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { order: { select: { orderNumber: true, shipmentStatus: true } } }
  });
  console.log(JSON.stringify(logs, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
