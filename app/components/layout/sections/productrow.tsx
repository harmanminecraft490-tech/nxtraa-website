import Link from "next/link";
import { ArrowRight } from "lucide-react";

import ProductCard from "../../../shop/productcard";
import type { Product } from "../../lib/product-types";

type ProductRowProps = {
  eyebrow: string;
  title: string;
  href: string;
  items: Product[];
};

export function ProductRow({ eyebrow, title, href, items }: ProductRowProps) {
  if (items.length === 0) return null;

  return (
    <section className="section-space border-b border-line-soft last:border-0 py-12 sm:py-16 lg:py-20">
      <div className="page-wrap">
        <div className="section-header flex flex-wrap items-end justify-between gap-4 sm:gap-6">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2 className="section-title mt-2 sm:mt-3 text-ink-950">{title}</h2>
          </div>
          <Link
            href={href}
            className="group flex items-center gap-1.5 text-xs font-bold text-accent transition hover:gap-2.5 sm:text-sm"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 sm:h-4 sm:w-4" />
          </Link>
        </div>

        {/* Mobile: horizontal swipe carousel (boAt-style). Desktop: grid. */}
        <div className="no-scrollbar -mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-8 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4 lg:gap-10">
          {items.map((product) => (
            <div
              key={product.id}
              className="w-[40%] shrink-0 snap-start sm:w-auto sm:shrink"
            >
              <ProductCard {...product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
