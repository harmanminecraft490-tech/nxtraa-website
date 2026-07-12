"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import AnnouncementBar from "../components/layout/announcementbar";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/footer";
import SmartSearchBar from "../components/ui/smartsearchbar";
import ProductCard from "../shop/productcard";
import { RECOMMENDED_SEARCHES, performSearch } from "../components/lib/search";
import { useProducts } from "../components/lib/products-store";

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams ? searchParams?.get("q") ?? "" : "";

  const products = useProducts();
  const results = useMemo(() => performSearch(products, q), [products, q]);
  const hasQuery = q.trim().length > 0;

  return (
    <main className="min-h-screen min-h-dvh bg-white">
      <div className="page-wrap section-space !pt-10">
        <div className="section-header max-w-2xl">
          <p className="eyebrow">Search</p>
          <h1 className="section-title mt-3 text-ink-950">Find products</h1>
        </div>

        <div className="mt-8 max-w-2xl">
          <SmartSearchBar
            size="lg"
            autoFocus
            initialQuery={q}
            onSearch={(term) =>
              router.push(`/search?q=${encodeURIComponent(term)}`)
            }
          />
        </div>

        {!hasQuery && (
          <div className="mt-10">
            <p className="mb-4 text-sm font-bold text-ink-950">Trending searches</p>
            <div className="flex flex-wrap gap-2">
              {RECOMMENDED_SEARCHES.map((term) => (
                <Link
                  key={term}
                  href={`/search?q=${encodeURIComponent(term)}`}
                  className="rounded-full border border-line bg-canvas px-4 py-2.5 text-sm font-semibold text-ink-700 transition hover:border-accent hover:bg-accent-soft hover:text-accent"
                >
                  {term}
                </Link>
              ))}
            </div>
            <p className="body-copy mt-8">
              Type or pick a search — results appear instantly in one step.
            </p>
          </div>
        )}

        {hasQuery && (
          <>
            <p className="mt-8 text-sm font-medium text-ink-500">
              {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;
              <span className="font-bold text-ink-950">{q}</span>&rdquo;
            </p>

            {results.length === 0 ? (
              <div className="mt-10 rounded-2xl border border-line-soft bg-canvas p-10 text-center">
                <p className="text-lg font-bold text-ink-950">No products found</p>
                <p className="mt-2 text-sm text-ink-500">
                  Try earbuds, chargers, or a model number like NECH-003
                </p>
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-2 gap-2 sm:mt-10 sm:grid-cols-2 sm:gap-8 md:grid-cols-3 lg:gap-10 xl:grid-cols-4">
                {results.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <Suspense
        fallback={
          <main className="page-wrap py-20 text-center text-ink-500">Loading search…</main>
        }
      >
        <SearchResults />
      </Suspense>
      <Footer />
    </>
  );
}
