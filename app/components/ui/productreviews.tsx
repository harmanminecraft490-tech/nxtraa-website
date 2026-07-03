"use client";

import { useState } from "react";
import { Star } from "lucide-react";

import {
  addReview,
  getAverageRating,
  getReviewsForProduct,
} from "../lib/reviews";

type ProductReviewsProps = {
  productId: number;
  catalogRating: number;
};

export default function ProductReviews({
  productId,
  catalogRating,
}: ProductReviewsProps) {
  const reviews = getReviewsForProduct(productId);
  const average = getAverageRating(productId, catalogRating);

  const [form, setForm] = useState({
    author: "",
    rating: 5,
    title: "",
    comment: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.comment.trim()) return;
    addReview(productId, form);
    setForm({ author: "", rating: 5, title: "", comment: "" });
  };

  return (
    <section className="mt-16 space-y-8 border-t border-line-soft pt-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Reviews</p>
          <h2 className="section-title mt-3 text-ink-950">Customer reviews</h2>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2">
          <Star size={18} fill="currentColor" className="text-amber-500" />
          <span className="text-lg font-extrabold text-ink-950">{average}</span>
          <span className="text-sm text-ink-500">({reviews.length} reviews)</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {reviews.slice(0, 6).map((review) => (
          <article
            key={review.id}
            className="space-y-3 rounded-2xl border border-line-soft bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-bold text-ink-950">{review.author}</p>
              <div className="flex items-center gap-0.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < review.rating ? "currentColor" : "none"}
                    className={i < review.rating ? "" : "text-gray-200"}
                  />
                ))}
              </div>
            </div>
            <h3 className="font-bold text-ink-900">{review.title}</h3>
            <p className="text-sm leading-relaxed text-ink-600">{review.comment}</p>
            <p className="text-xs text-ink-400">
              {new Date(review.date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </article>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-line bg-canvas p-6 sm:p-8"
      >
        <h3 className="text-lg font-extrabold text-ink-950">Write a review</h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink-700">
              Your name
            </label>
            <input
              value={form.author}
              onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
              placeholder="Optional"
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-ink-950"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink-700">
              Rating
            </label>
            <select
              value={form.rating}
              onChange={(e) =>
                setForm((f) => ({ ...f, rating: Number(e.target.value) }))
              }
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-ink-950"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} stars
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Review title
          </label>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Summarize your experience"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gray-950"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Your review
          </label>
          <textarea
            required
            rows={4}
            value={form.comment}
            onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
            placeholder="What did you like about this product?"
            className="w-full resize-none rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-ink-950"
          />
        </div>
        <button
          type="submit"
          className="rounded-full bg-cyan-600 px-8 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-cyan-700 hover:shadow-lg active:scale-95"
        >
          Submit review
        </button>
      </form>
    </section>
  );
}
