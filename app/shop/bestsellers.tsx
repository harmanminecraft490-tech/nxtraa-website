import Link from "next/link";
import { ArrowRight } from "lucide-react";

import ProductCard from "./productcard";
import { getBestsellers } from "../components/lib/products";

export default function BestSellers() {
  const bestsellers = getBestsellers(8);

  if (bestsellers.length === 0) return null;

  return (
    <section className="section-space border-b border-line-soft">
      <div className="page-wrap">
        <div className="section-header flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Top rated</p>
            <h2 className="section-title mt-3 text-ink-950">Bestsellers</h2>
          </div>
          <Link
            href="/shop"
            className="flex items-center gap-2 text-sm font-bold text-accent hover:underline"
          >
            View all <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-9 lg:grid-cols-4 lg:gap-10">
          {bestsellers.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
}
