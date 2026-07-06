// Client-side product search over the shared products store.

import type { Product } from "./product-types";
import { getProductsSnapshot } from "./products-store";

export const RECOMMENDED_SEARCHES = [
  "Earbuds",
  "Neckbands",
  "Fast Chargers",
  "Power Banks",
  "Type-C Cables",
  "Bluetooth Speakers",
  "NE AP-111",
  "NENB-110",
  "NECH-003",
  "NEPB-4021",
];

export function performSearch(products: Product[], query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const terms = q.split(/\s+/).filter(Boolean);

  return products
    .map((product) => {
      const haystack = [
        product.title,
        product.model,
        product.category,
        product.badge,
        product.description,
        ...product.highlights,
      ]
        .join(" ")
        .toLowerCase();

      const score = terms.reduce((acc, term) => {
        if (product.model.toLowerCase() === term) return acc + 100;
        if (product.model.toLowerCase().includes(term)) return acc + 50;
        if (product.title.toLowerCase().includes(term)) return acc + 40;
        if (product.category.toLowerCase().includes(term)) return acc + 30;
        if (haystack.includes(term)) return acc + 10;
        return acc;
      }, 0);

      return { product, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.product);
}

/** Searches the client-side catalog snapshot (load it via useProducts/loadProducts). */
export function searchProducts(query: string): Product[] {
  return performSearch(getProductsSnapshot(), query);
}

export function getSearchSuggestions(query: string, limit = 6): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return RECOMMENDED_SEARCHES.slice(0, limit);

  const products = getProductsSnapshot();
  const fromProducts = products
    .flatMap((p) => [p.model, p.title, p.category])
    .filter((s, i, arr) => arr.indexOf(s) === i && s.toLowerCase().includes(q));

  const fromRecommended = RECOMMENDED_SEARCHES.filter((s) =>
    s.toLowerCase().includes(q),
  );

  const combined = [...fromProducts, ...fromRecommended];
  const unique = Array.from(new Set(combined));
  return unique.slice(0, limit);
}
