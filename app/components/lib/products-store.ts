"use client";

// Client-side products store. Fetches the catalog once from /api/products and
// shares it across all client components (cart, checkout, search, drawers).
// Never imports Prisma — server code should use products-cache.ts instead.

import { useEffect, useState, useSyncExternalStore } from "react";

import type { Product } from "./product-types";
import { UNKNOWN_PRODUCT } from "./product-types";

const EMPTY: Product[] = [];

let products: Product[] = EMPTY;
let inflight: Promise<Product[]> | null = null;
let loaded = false;

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
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

export function loadProducts(): Promise<Product[]> {
  if (loaded) return Promise.resolve(products);
  if (inflight) return inflight;

  inflight = fetch("/api/products")
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to load products (HTTP ${response.status})`);
      }
      const data = (await response.json()) as Product[];
      products = Array.isArray(data) ? data : EMPTY;
      loaded = true;
      emit();
      return products;
    })
    .catch(() => {
      // Allow a retry on the next call instead of caching the failure.
      inflight = null;
      return products;
    });

  return inflight;
}

export function getProductById(id: number): Product {
  return products.find((p) => p.id === id) ?? { ...UNKNOWN_PRODUCT, id };
}

/** Subscribes to the shared catalog and triggers the initial fetch. */
export function useProducts(): Product[] {
  const snapshot = useSyncExternalStore(
    subscribeProducts,
    getProductsSnapshot,
    getServerProductsSnapshot,
  );

  useEffect(() => {
    void loadProducts();
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
    // If the catalog is already loaded, initial state is already false.
    if (loaded) return;
    let active = true;
    // loadProducts() resolves immediately when already loaded, and on error too,
    // so loading always settles — no infinite skeleton.
    void loadProducts().finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { products, loading };
}
