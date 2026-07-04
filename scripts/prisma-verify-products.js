const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

(async () => {
  const prisma = new PrismaClient();

  try {
    const productsPath = path.join(process.cwd(), "app/components/lib/products-data.json");
    const raw = fs.readFileSync(productsPath, "utf-8");
    const json = JSON.parse(raw);

    const dbCount = await prisma.product.count();

    const first = await prisma.product.findFirst({ orderBy: { id: "asc" } });
    const last = await prisma.product.findFirst({ orderBy: { id: "desc" } });

    console.log("=== products-data.json ===");
    console.log("jsonCount:", json.length);
    console.log("=== DB ===");
    console.log("dbCount:", dbCount);
    console.log("firstProduct:", first);
    console.log("lastProduct:", last);

    if (dbCount !== json.length) {
      console.warn("Count mismatch! Seed likely did not populate the current DB.");
      process.exitCode = 1;
    }
  } finally {
    await prisma.$disconnect();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

