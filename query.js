const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const logs = await prisma.shipmentLog.findMany({
    where: { order: { orderNumber: "NX-2026-98207" } },
    orderBy: { createdAt: "desc" },
    take: 20
  });
  console.log(JSON.stringify(logs.map(l => ({ action: l.action, status: l.status, error: l.error, detailKeys: l.details ? Object.keys(l.details) : null })), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
