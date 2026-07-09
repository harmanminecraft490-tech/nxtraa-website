"use client";

import { useMemo, useState } from "react";

import ProductCard from "./productcard";
import { categories } from "../components/lib/product-types";
import { useCatalog } from "../components/lib/products-store";

type SortKey = "featured" | "price-asc" | "price-desc" | "rating" | "discount";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "discount", label: "Biggest Discount" },
];

const discountOf = (p: { price: number; oldPrice: number }) =>
  p.oldPrice > p.price && p.oldPrice > 0
    ? (p.oldPrice - p.price) / p.oldPrice
    : 0;

export default function ShopClient() {
  const { products, loading } = useCatalog();
  const [category, setCategory] = useState<string>("All");
  const [sort, setSort] = useState<SortKey>("featured");

  // Only show category chips that actually have products, so the filter row
  // never offers a dead end.
  const availableCategories = useMemo(() => {
    const present = new Set(products.map((p) => p.category));
    return categories.filter((c) => c === "All" || present.has(c));
  }, [products]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) map.set(p.category, (map.get(p.category) ?? 0) + 1);
    return map;
  }, [products]);

  const visible = useMemo(() => {
    const filtered =
      category === "All"
        ? products
        : products.filter((p) => p.category === category);

    const sorted = [...filtered];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "discount":
        sorted.sort((a, b) => discountOf(b) - discountOf(a));
        break;
      default:
        break;
    }
    return sorted;
  }, [products, category, sort]);

  return (
    <section className="section-space border-t border-line-soft" id="collection">
      <div className="page-wrap">
        <div className="section-header flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">The collection</p>
            <h2 className="section-title mt-3 text-ink-950">Shop all products</h2>
            <p className="body-copy mt-3">
              {loading
                ? "Loading the catalog…"
                : `${visible.length} ${visible.length === 1 ? "product" : "products"}${
                    category !== "All" ? ` in ${category}` : ""
                  }`}
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-ink-500">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="select h-11 w-auto min-w-[180px] !rounded-full"
              aria-label="Sort products"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Category filter */}
        <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto pb-1">
          {availableCategories.map((c) => {
            const active = c === category;
            const count = c === "All" ? products.length : counts.get(c) ?? 0;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "border-ink-950 bg-ink-950 text-white"
                    : "border-line bg-white text-ink-700 hover:border-accent hover:text-accent"
                }`}
              >
                {c}
                {!loading && (
                  <span className={active ? "text-white/60" : "text-ink-400"}>
                    {" "}
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="mt-10 grid grid-cols-3 gap-2.5 sm:grid-cols-2 sm:gap-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-line-soft bg-canvas p-12 text-center">
            <p className="text-lg font-bold text-ink-950">No products here yet</p>
            <p className="mt-2 text-sm text-ink-500">
              Try another category — new stock is added regularly.
            </p>
            <button
              type="button"
              onClick={() => setCategory("All")}
              className="btn btn-primary mt-6"
            >
              View all products
            </button>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-3 gap-2.5 sm:grid-cols-2 sm:gap-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-10">
            {visible.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="card-premium !p-0 overflow-hidden">
      <div className="aspect-square w-full animate-pulse bg-mist sm:aspect-[4/3]" />
      <div className="flex flex-col gap-2 p-2 sm:gap-3 sm:p-6">
        <div className="h-3 w-3/4 animate-pulse rounded-full bg-mist" />
        <div className="h-3 w-1/2 animate-pulse rounded-full bg-mist" />
        <div className="mt-1 h-7 w-full animate-pulse rounded-full bg-mist sm:h-9" />
      </div>
    </div>
  );
}
