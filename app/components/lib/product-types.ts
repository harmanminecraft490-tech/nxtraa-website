// Shared product domain types and constants.
// Safe to import from both server and client code (no Prisma, no fetch).

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

export type Category = (typeof categories)[number];

export const FREE_DELIVERY_THRESHOLD = 999;
export const DELIVERY_FEE = 79;

export function getDeliveryFee(subtotal: number): number {
  return subtotal >= FREE_DELIVERY_THRESHOLD || subtotal <= 0 ? 0 : DELIVERY_FEE;
}

/** Rupee amount with Indian thousands grouping, e.g. 1299 -> "1,299". */
export function formatPrice(amount: number): string {
  return Math.round(amount).toLocaleString("en-IN");
}

/** Discount percent, guarded against a zero/absent oldPrice. */
export function getDiscountPercent(price: number, oldPrice: number): number {
  if (!(oldPrice > price) || oldPrice <= 0) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export const UNKNOWN_PRODUCT: Product = {
  id: 0,
  title: "Unknown Product",
  model: "",
  price: 0,
  oldPrice: 0,
  rating: 0,
  badge: "",
  category: "",
  color: "",
  description: "",
  highlights: [],
  imageUrls: [],
};
