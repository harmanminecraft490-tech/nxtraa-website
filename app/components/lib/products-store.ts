"use client";

// Client-side products store. Fetches the catalog from /api/products and shares
// it across all client components (shop, cart, checkout, search, drawers).
// Never imports Prisma — server code should use products-cache.ts instead.
//
// The store revalidates in the background on every mount and whenever the tab
// regains focus, so edits made in the admin panel show up on the storefront
// without a hard refresh.

import { useEffect, useState, useSyncExternalStore } from "react";

import type { Product } from "./product-types";
import { UNKNOWN_PRODUCT } from "./product-types";

const EMPTY: Product[] = [];

let products: Product[] = EMPTY;
let inflight: Promise<Product[]> | null = null;
let loaded = false;
let signature = "";

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

// Cheap change-detection so background revalidation only re-renders subscribers
// when the catalog actually changed (id, price, title, images, etc.).
function computeSignature(list: Product[]): string {
  return list
    .map(
      (p) =>
        `${p.id}:${p.price}:${p.oldPrice}:${p.rating}:${p.badge}:${p.category}:${p.title}:${(p.imageUrls || []).length}`,
    )
    .join("|");
}

export function subscribeProducts(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getProductsSnapshot(): Product[] {
  return products;
}

function getServerProductsSnapshot(): Product[] {
  return EMPTY;
}

/**
 * Fetch the catalog. Always hits the network (deduped across concurrent
 * callers) so the store stays fresh, but only notifies subscribers when the
 * data actually changed.
 */
export function loadProducts(): Promise<Product[]> {
  if (inflight) return inflight;

  inflight = fetch("/api/products", { cache: "no-store" })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to load products (HTTP ${response.status})`);
      }
      const data = (await response.json()) as Product[];
      const next = Array.isArray(data) ? data : EMPTY;
      const nextSignature = computeSignature(next);

      loaded = true;

      if (nextSignature !== signature) {
        products = next;
        signature = nextSignature;
        emit();
      }
      return products;
    })
    .catch(() => products)
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

export function getProductById(id: number): Product {
  return products.find((p) => p.id === id) ?? { ...UNKNOWN_PRODUCT, id };
}

/** Subscribes to the shared catalog and revalidates it in the background. */
export function useProducts(): Product[] {
  const snapshot = useSyncExternalStore(
    subscribeProducts,
    getProductsSnapshot,
    getServerProductsSnapshot,
  );

  useEffect(() => {
    // Revalidate on mount (covers navigating in from the admin panel) …
    void loadProducts();

    // … and whenever the tab regains focus or becomes visible again.
    const revalidate = () => {
      if (document.visibilityState === "visible") void loadProducts();
    };
    window.addEventListener("focus", revalidate);
    document.addEventListener("visibilitychange", revalidate);
    return () => {
      window.removeEventListener("focus", revalidate);
      document.removeEventListener("visibilitychange", revalidate);
    };
  }, []);

  return snapshot;
}

/**
 * Like {@link useProducts} but also reports whether the initial catalog fetch
 * is still in flight, so callers can render skeletons instead of an empty grid.
 */
export function useCatalog(): { products: Product[]; loading: boolean } {
  const products = useProducts();
  const [loading, setLoading] = useState(!loaded);

  useEffect(() => {
    // Initial state already reflects `loaded`; only settle the spinner once the
    // first fetch resolves (loadProducts resolves immediately if already loaded).
    if (loaded) return;
    let active = true;
    void loadProducts().finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { products, loading };
}
