import { PrismaClient } from "@prisma/client";

import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

type ProductSeed = {
  id: number;
  title: string;
  model: string;
  price: number;
  oldPrice: number;
  rating: number;
  badge: string;
  category: string;
  color: string;
  description: string;
  highlights: string[];
  imageUrls: string[];
};

async function main() {
  const beforeCount = await prisma.product.count();

  if (beforeCount === 0) {
    const productsPath = path.join(
      process.cwd(),
      "app/components/lib/products-data.json",
    );

    const raw = fs.readFileSync(productsPath, "utf-8");
    const products = JSON.parse(raw) as ProductSeed[];

    console.log(`Seeding ${products.length} products into PostgreSQL...`);

    for (const p of products) {
      // Idempotent import: preserve ids and upsert deterministically.
      await prisma.product.upsert({
        where: { id: p.id },
        update: {
          title: p.title,
          model: p.model,
          price: p.price,
          oldPrice: p.oldPrice,
          rating: p.rating,
          badge: p.badge,
          category: p.category,
          color: p.color,
          description: p.description,
          highlights: p.highlights,
          imageUrls: p.imageUrls,
        },
        create: {
          id: p.id,
          title: p.title,
          model: p.model,
          price: p.price,
          oldPrice: p.oldPrice,
          rating: p.rating,
          badge: p.badge,
          category: p.category,
          color: p.color,
          description: p.description,
          highlights: p.highlights,
          imageUrls: p.imageUrls,
        },
      });
    }
  } else {
    console.log(`Seed skipped: Product.count() is ${beforeCount}`);
  }

  // Products are seeded with explicit ids, which does not advance the
  // autoincrement sequence. Without this, the first admin-created product would
  // collide with an existing id. Realign the sequence to MAX(id) so new
  // products created via the admin panel get fresh, non-colliding ids.
  await prisma.$executeRawUnsafe(
    `SELECT setval(
       pg_get_serial_sequence('"Product"', 'id'),
       COALESCE((SELECT MAX(id) FROM "Product"), 0) + 1,
       false
     )`,
  );

  const afterCount = await prisma.product.count();

  const first5 = await prisma.product.findMany({
    orderBy: { id: "asc" },
    take: 5,
    select: { id: true, title: true },
  });

  console.log(`Final Product.count() = ${afterCount}`);
  console.log("First 5 product titles:", first5.map((p) => p.title));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });


