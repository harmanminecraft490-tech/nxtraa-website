import { products, type Product } from "./products";

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

export function searchProducts(query: string): Product[] {
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

      let score = 0;
      for (const term of terms) {
        if (product.model.toLowerCase() === term) score += 100;
        else if (product.model.toLowerCase().includes(term)) score += 50;
        else if (product.title.toLowerCase().includes(term)) score += 40;
        else if (product.category.toLowerCase().includes(term)) score += 30;
        else if (haystack.includes(term)) score += 10;
      }

      return { product, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.product);
}

export function getSearchSuggestions(query: string, limit = 6): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return RECOMMENDED_SEARCHES.slice(0, limit);

  const fromProducts = products
    .flatMap((p) => [p.model, p.title, p.category])
    .filter((s, i, arr) => arr.indexOf(s) === i && s.toLowerCase().includes(q));

  const fromRecommended = RECOMMENDED_SEARCHES.filter((s) =>
    s.toLowerCase().includes(q),
  );

  return [...fromProducts, ...fromRecommended]
    .filter((s, i, arr) => arr.indexOf(s) === i)
    .slice(0, limit);
}
