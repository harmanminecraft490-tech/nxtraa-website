import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();


async function main() {
  const productsPath = path.join(process.cwd(), "app/components/lib/products-data.json");
  const raw = fs.readFileSync(productsPath, "utf-8");
  const products = JSON.parse(raw) as Array<{
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
  }>;

  // Upsert by id to keep deterministic IDs
  for (const p of products) {
    // @ts-ignore: product model is added during Option B migration
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
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

