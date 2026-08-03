const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Deleting all orders...");
  const deleteOrders = await prisma.order.deleteMany({});
  console.log(`Deleted ${deleteOrders.count} orders.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
