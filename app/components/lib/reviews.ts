import type { Review } from "./products";

const STORAGE_KEY = "nxteraa-reviews";

const AUTHORS = [
  "Rahul K.",
  "Priya M.",
  "Amit S.",
  "Neha R.",
  "Vikram P.",
  "Sneha T.",
  "Arjun D.",
  "Kavya L.",
];

const COMMENTS = [
  "Solid build quality and works exactly as described in the catalogue.",
  "Good value for money. Delivery was quick and packaging was neat.",
  "Battery backup is impressive. Using it daily without issues.",
  "Clear sound and comfortable fit. Recommended for everyday use.",
  "Charging speed is fast. Happy with this Nxteraa product.",
  "Worth the MRP. Feels premium and durable.",
];

function seededReviews(productId: number): Review[] {
  const base = productId * 7;
  return [0, 1, 2].map((i) => ({
    id: `seed-${productId}-${i}`,
    productId,
    author: AUTHORS[(base + i) % AUTHORS.length],
    rating: 4 + ((base + i) % 2),
    title: i === 0 ? "Great product" : i === 1 ? "Value for money" : "Works well",
    comment: COMMENTS[(base + i) % COMMENTS.length],
    date: new Date(2025, (base + i) % 12, 1 + ((base + i) % 28)).toISOString(),
  }));
}

function readAll(): Review[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Review[]) : [];
  } catch {
    return [];
  }
}

function writeAll(reviews: Review[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

export function getReviewsForProduct(productId: number): Review[] {
  const user = readAll().filter((r) => r.productId === productId);
  // Remove fake/seeded reviews - only show real user reviews
  return user.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export function getAverageRating(productId: number, catalogRating: number): number {
  const reviews = getReviewsForProduct(productId);
  if (reviews.length === 0) return catalogRating;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  return Math.round(avg * 10) / 10;
}

export function addReview(
  productId: number,
  data: { author: string; rating: number; title: string; comment: string },
) {
  const review: Review = {
    id: `user-${Date.now()}`,
    productId,
    author: data.author.trim() || "Nxteraa Customer",
    rating: Math.min(5, Math.max(1, data.rating)),
    title: data.title.trim() || "My review",
    comment: data.comment.trim(),
    date: new Date().toISOString(),
  };
  const all = readAll();
  all.unshift(review);
  writeAll(all);
  return review;
}
