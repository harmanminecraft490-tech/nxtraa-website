import rawProducts from "./products-data.json";

export type Product = {
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

export type Review = {
  id: string;
  productId: number;
  author: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
};

export const products: Product[] = rawProducts as Product[];

export const categories = [
  "All",
  "Neckbands",
  "Earbuds",
  "Chargers",
  "Cables",
  "Power Banks",
  "Speakers",
  "Car Holders",
  "Adapters",
  "Screen Guards",
  "Accessories",
] as const;

export function getProductById(id: number) {
  return products.find((product) => product.id === id) ?? products[0];
}

export function getFeaturedProducts() {
  return products.filter((p) =>
    [9, 13, 20, 33, 44, 97, 100, 109].includes(p.id),
  );
}

export function getBestsellers(limit = 4) {
  return products
    .filter((p) => [9, 13, 20, 33, 44, 97, 100, 126].includes(p.id))
    .slice(0, limit);
}

export function getMustTry(limit = 4) {
  return products
    .filter((p) => [13, 15, 33, 100, 109, 114, 126, 134].includes(p.id))
    .slice(0, limit);
}

export function getFastChargers(limit = 4) {
  return products.filter((p) => p.category === "Chargers").slice(0, limit);
}

export function getPowerPicks(limit = 4) {
  return products.filter((p) => p.category === "Power Banks").slice(0, limit);
}

export function getProductsByCategory(category: string) {
  if (category === "All") return products;
  return products.filter((p) => p.category === category);
}

export function getRecommendedProducts(currentProductId: number, limit = 4) {
  const currentProduct = getProductById(currentProductId);
  const sameCategoryProducts = products.filter(
    (p) => p.category === currentProduct.category && p.id !== currentProductId
  );

  if (sameCategoryProducts.length >= limit) {
    return sameCategoryProducts.slice(0, limit);
  }

  const bestsellers = getBestsellers(limit * 2).filter(
    (p) => p.id !== currentProductId
  );
  const combined = [...sameCategoryProducts, ...bestsellers];
  
  const unique = Array.from(
    new Map(combined.map((p) => [p.id, p])).values()
  );

  return unique.slice(0, limit);
}
