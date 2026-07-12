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

// --- Deal pricing -----------------------------------------------------------
// The generated catalog priced every product at a uniform ~18% off MRP, which
// made the whole store read as one flat, unconvincing discount. Instead, each
// product gets a pseudo-random deal percent derived from its id — random-looking
// across the catalog but stable per product across renders, reloads and
// server/client boundaries (no hydration mismatch, no shifting prices).

export const DEAL_PERCENT_MIN = 40;
export const DEAL_PERCENT_MAX = 70;

/** Deterministic per-product deal percent in [DEAL_PERCENT_MIN, DEAL_PERCENT_MAX]. */
export function getDealPercent(id: number): number {
  // Two rounds of integer hashing (Knuth multiplicative + xorshift) so
  // consecutive ids don't get consecutive percents.
  let h = Math.imul(id + 0x9e3779b9, 2654435761);
  h ^= h >>> 15;
  h = Math.imul(h, 2246822519);
  h ^= h >>> 13;
  const span = DEAL_PERCENT_MAX - DEAL_PERCENT_MIN + 1;
  return DEAL_PERCENT_MIN + ((h >>> 0) % span);
}

/**
 * Display MRP implied by the product's deal percent, rounded up to a
 * shopper-friendly value ending in 9 (e.g. 1,199 → "Rs. 2,999").
 */
export function getDealOldPrice(id: number, price: number): number {
  if (price <= 0) return 0;
  const percent = getDealPercent(id);
  const raw = price / (1 - percent / 100);
  return Math.max(price + 1, Math.ceil(raw / 10) * 10 - 1);
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
