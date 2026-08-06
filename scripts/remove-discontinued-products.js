/**
 * Removes discontinued products from the PostgreSQL database.
 * Products to remove (not in the latest Nxteraa catalogue):
 *   NX-P110, NX-P111, NX-P112, NX-P113, NX-P114, NX-P115, NX-P116, NX-P117, NX-P118,
 *   NX-P018, NX-P019, NX-P028,
 *   NX-P106, NX-P107, NX-P108,
 *   NX-P134
 *
 * Usage: node scripts/remove-discontinued-products.js
 */

const path = require("path");
const dotenv = require("dotenv");

// Load env vars
dotenv.config({ path: path.join(__dirname, "../.env.local") });
dotenv.config({ path: path.join(__dirname, "../.env") });

// The pooled URL works for direct script connections
process.env.DATABASE_URL =
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.DATABASE_URL;

console.log(
  "Connecting to:",
  (process.env.DATABASE_URL || "").replace(/:[^:@]+@/, ":***@")
);

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const MODELS_TO_REMOVE = [
  "NX-P110",
  "NX-P111",
  "NX-P112",
  "NX-P113",
  "NX-P114",
  "NX-P115",
  "NX-P116",
  "NX-P117",
  "NX-P118",
  "NX-P018",
  "NX-P019",
  "NX-P028",
  "NX-P106",
  "NX-P107",
  "NX-P108",
  "NX-P134",
];

async function main() {
  console.log("Finding discontinued products in the database...");

  const toDelete = await prisma.product.findMany({
    where: { model: { in: MODELS_TO_REMOVE } },
    select: { id: true, model: true, title: true },
  });

  if (toDelete.length === 0) {
    console.log(
      "No matching products found in the database — nothing to delete."
    );
    return;
  }

  console.log(`Found ${toDelete.length} product(s) to delete:`);
  for (const p of toDelete) {
    console.log(`  id=${p.id}  model=${p.model}  title=${p.title}`);
  }

  const ids = toDelete.map((p) => p.id);

  const { count } = await prisma.product.deleteMany({
    where: { id: { in: ids } },
  });

  console.log(`\nDeleted ${count} product(s) from the database.`);

  const remaining = await prisma.product.count();
  console.log(`Remaining product count: ${remaining}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
