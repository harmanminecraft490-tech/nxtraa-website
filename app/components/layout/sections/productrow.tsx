"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

import ProductCard from "../../../shop/productcard";
import type { Product } from "../../lib/products";

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
    <section className="section-space border-b border-line-soft last:border-0">
      <div className="page-wrap">
        <div className="section-header flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2 className="section-title mt-3 text-ink-950">{title}</h2>
          </div>
          {isVisible && (
            <Link
              href={href}
              className="flex items-center gap-2 text-sm font-bold text-accent hover:underline"
            >
              View all <ArrowRight size={16} />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-9 lg:grid-cols-4 lg:gap-10">
          {items.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
}
