// Server-side product queries. Client components should use products-store.ts.

import type { Product } from "./product-types";
import { categories } from "./product-types";
import { getAllProductsCached } from "./products-cache";

export type { Product };
export { categories };

export async function getProductById_async(id: number): Promise<Product> {
  const products = await getAllProductsCached();
  return products.find((p) => p.id === id) ?? products[0];
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const products = await getAllProductsCached();
  if (category === "All") return products;
  return products.filter((p) => p.category === category);
}

export async function getRecommendedProducts(
  currentProductId: number,
  limit = 4,
): Promise<Product[]> {
  const products = await getAllProductsCached();
  const currentProduct = products.find((p) => p.id === currentProductId) ?? products[0];
  if (!currentProduct) return [];

  const sameCategoryProducts = products.filter(
    (p) => p.category === currentProduct.category && p.id !== currentProductId,
  );

  if (sameCategoryProducts.length >= limit) {
    return sameCategoryProducts.slice(0, limit);
  }

  const otherProducts = products.filter(
    (p) => p.category !== currentProduct.category && p.id !== currentProductId,
  );

  return [...sameCategoryProducts, ...otherProducts].slice(0, limit);
}

export async function getBestsellers(limit: number): Promise<Product[]> {
  const products = await getAllProductsCached();
  // Ratings are stored as integers (0–5), so rank by highest rating and fall
  // back to catalog order rather than filtering on a fractional threshold that
  // no integer rating can satisfy.
  return [...products]
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, limit);
}

export async function getMustTry(limit: number): Promise<Product[]> {
  const products = await getAllProductsCached();
  const newArrivals = products.filter((p) => p.badge === "New");
  if (newArrivals.length >= limit) return newArrivals.slice(0, limit);

  // Not enough "New" products — fill with the highest-rated remaining ones.
  const topRated = products
    .filter((p) => p.badge !== "New")
    .sort((a, b) => b.rating - a.rating);
  return [...newArrivals, ...topRated].slice(0, limit);
}

export async function getFastChargers(limit: number): Promise<Product[]> {
  const products = await getAllProductsCached();
  const chargers = products.filter((p) => p.category === "Chargers");
  const fast = chargers.filter((p) => /fast/i.test(p.title));
  if (fast.length >= limit) return fast.slice(0, limit);
  return [...fast, ...chargers.filter((p) => !/fast/i.test(p.title))].slice(0, limit);
}
