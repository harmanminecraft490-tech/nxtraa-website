// Server-side product cache backed by Prisma. Do not import from client
// components — use products-store.ts there instead.

import prisma from "@/lib/prisma";

import type { Product } from "./product-types";

export type { Product };

let cache: Product[] | null = null;
let cacheAtMs: number | null = null;

const TTL_MS = 30_000; // 30 seconds

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
    cache = products;
    cacheAtMs = Date.now();
    return products;
  } catch (error) {
    console.error("Failed to fetch products from database:", error);
    return []; // Return empty array on error to prevent site crash
  }
}
