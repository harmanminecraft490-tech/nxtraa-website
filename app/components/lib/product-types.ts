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
