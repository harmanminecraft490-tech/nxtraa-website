// Server-side product cache backed by Prisma. Do not import from client
// components — use products-store.ts there instead.

import prisma from "@/lib/prisma";

import type { Product } from "./product-types";
import { getDealOldPrice, getDiscountPercent } from "./product-types";

export type { Product };

// The generated catalog marks every product up by the same ~18%, which reads
// as one flat fake discount. Storefront responses replace that formulaic MRP
// with a per-product deal (40–70% off, deterministic per id — see
// product-types.ts). Discounts of 25%+ are assumed to be set deliberately in
// the admin panel and are left untouched. The admin API reads Prisma directly,
// so admins always see and edit the raw database values.
function withDealPricing(products: Product[]): Product[] {
  return products.map((p) => {
    if (p.price <= 0 || getDiscountPercent(p.price, p.oldPrice) >= 25) return p;
    return { ...p, oldPrice: getDealOldPrice(p.id, p.price) };
  });
}

let cache: Product[] | null = null;
let cacheAtMs: number | null = null;

// Short TTL so admin edits appear on the storefront within a few seconds even
// on serverless, where a public request may hit a different warm instance than
// the one that ran (and locally invalidated) the mutation.
const TTL_MS = 5_000; // 5 seconds

function isCacheFresh() {
  if (!cache || !cacheAtMs) return false;
  return Date.now() - cacheAtMs < TTL_MS;
}

export function invalidateProductsCache() {
  cache = null;
  cacheAtMs = null;
}

export async function getAllProductsCached(): Promise<Product[]> {
  if (isCacheFresh()) return cache as Product[];

  try {
    const products = (await prisma.product.findMany({
      orderBy: { id: "asc" },
    })) as Product[];
    cache = withDealPricing(products);
    cacheAtMs = Date.now();
    return cache;
  } catch (error) {
    console.error("Failed to fetch products from database:", error);
    return []; // Return empty array on error to prevent site crash
  }
}
