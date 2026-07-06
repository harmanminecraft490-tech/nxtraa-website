"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

import ProductCard from "../../../shop/productcard";
import type { Product } from "../../lib/product-types";

type ProductRowProps = {
  eyebrow: string;
  title: string;
  href: string;
  items: Product[];
};

export function ProductRow({ eyebrow, title, href, items }: ProductRowProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsVisible(scrollY < 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="section-space border-b border-line-soft last:border-0 py-12 sm:py-16 lg:py-20">
      <div className="page-wrap">
        <div className="section-header flex flex-wrap items-end justify-between gap-4 sm:gap-6">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2 className="section-title mt-2 sm:mt-3 text-ink-950">{title}</h2>
          </div>
          {isVisible && (
            <Link
              href={href}
              className="flex items-center gap-2 text-xs font-bold text-accent hover:underline sm:text-sm"
            >
              View all <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4 lg:gap-10">
          {items.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
}
