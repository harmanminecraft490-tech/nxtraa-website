export type Review = {
  id: string;
  productId: number;
  author: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
};

const STORAGE_KEY = "nxteraa-reviews";

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
