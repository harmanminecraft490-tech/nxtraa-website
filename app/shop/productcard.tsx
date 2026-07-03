"use client";

import Link from "next/link";
import { Heart, Minus, Plus, ShoppingCart, Star, Trash2 } from "lucide-react";

import ProductVisual from "../components/ui/productvisual";

interface ProductCardProps {
  id: number;
  title: string;
  model: string;
  category: string;
  price: number;
  oldPrice: number;
  rating: number;
  badge?: string;
  imageUrls?: string[];
}

export default function ProductCard({
  id,
  title,
  model,
  category,
  price,
  oldPrice,
  rating,
  badge,
  imageUrls = [],
}: ProductCardProps) {
  const discount = Math.round(((oldPrice - price) / oldPrice) * 100);
  const buyHref = `/buy?product=${id}`;
  const cartHref = `/buy?product=${id}&action=cart`;

  return (
    <article className="card-premium !p-0 flex flex-col h-full">
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-[24px] border-b border-line-soft">
        {badge && (
          <span className="absolute left-4 top-4 z-10 max-w-[calc(100%-6rem)] truncate rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-ink-950 shadow-sm backdrop-blur-sm">
            {badge}
          </span>
        )}

        <Link
          href="/wishlist"
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink-900 shadow-md transition-all duration-300 hover:bg-accent hover:text-white hover:scale-110"
          aria-label={`Add ${title} to wishlist`}
          onClick={(e) => e.stopPropagation()}
        >
          <Heart size={16} />
        </Link>

        <Link href={buyHref} className="block h-full">
          <ProductVisual category={category} model={model} size="md" hover productId={id} imageUrls={imageUrls} />
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-[10px] font-extrabold uppercase tracking-[0.2em] text-accent">
            {category}
          </p>
          <div className="flex shrink-0 items-center gap-1.5 text-sm font-bold text-amber-500">
            <Star size={14} fill="currentColor" />
            <span>{rating}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Link href={buyHref} className="block">
            <h3 className="line-clamp-2 text-base font-black leading-snug text-ink-950 transition-colors duration-300 hover:text-accent sm:text-lg">
              {title}
            </h3>
          </Link>
          <p className="text-sm font-medium text-ink-500">{model}</p>
        </div>

        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
          <span className="text-2xl font-black tracking-tight text-ink-950">
            Rs. {price}
          </span>
          <span className="text-xs font-semibold text-ink-400 line-through sm:text-sm">
            Rs. {oldPrice}
          </span>
          <span className="rounded-full bg-accent-soft px-2 py-1 text-[10px] font-bold text-accent-deep">
            {discount}% OFF
          </span>
        </div>

        <div className="mt-auto flex items-center gap-3 pt-2">
          <Link
            href={cartHref}
            className="h-10 flex-1 rounded-full flex items-center justify-center gap-2 text-sm font-bold border-2 border-accent bg-white text-accent hover:bg-accent hover:text-white transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:scale-[0.97] hover:shadow-[0_8px_20px_-6px_rgba(6,182,212,0.45)]"
            aria-label="Add to Cart"
          >
            <ShoppingCart size={16} />
            Add to Cart
          </Link>
          <Link
            href={buyHref}
            className="h-10 flex-1 rounded-full flex items-center justify-center text-sm font-bold bg-accent text-white hover:bg-accent-deep transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:scale-[0.97] hover:shadow-[0_8px_20px_-6px_rgba(6,182,212,0.45)]"
          >
            Buy Now
          </Link>
        </div>
      </div>
    </article>
  );
}

export function CartLineItem({
  productId,
  title,
  model,
  category,
  price,
  quantity,
  onUpdate,
  onRemove,
}: {
  productId: number;
  title: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  onUpdate: (qty: number) => void;
  onRemove: () => void;
}) {
  return (
    <article className="card-premium !flex-col sm:!flex-row sm:grid sm:grid-cols-[130px_1fr_auto] sm:items-center sm:gap-8 hover:!translate-y-0">
      <Link
        href={`/buy?product=${productId}`}
        className="aspect-square overflow-hidden rounded-2xl border border-line-soft shrink-0 block"
      >
        <ProductVisual category={category} model={model} size="sm" productId={productId} />
      </Link>

      <div className="min-w-0 space-y-2">
        <Link href={`/buy?product=${productId}`}>
          <h3 className="text-lg font-black text-ink-950 hover:text-accent transition-colors">
            {title}
          </h3>
        </Link>
        <p className="text-sm font-semibold text-ink-500">{model}</p>
        <p className="pt-2 text-2xl font-black text-accent">Rs. {price}</p>
      </div>

      <div className="flex items-center justify-between gap-6 sm:flex-col sm:items-end">
        <div className="inline-flex h-14 items-center rounded-full border border-line bg-canvas">
          <button
            type="button"
            onClick={() => onUpdate(quantity - 1)}
            className="flex h-14 w-12 items-center justify-center rounded-full hover:bg-white"
            aria-label="Decrease quantity"
          >
            <Minus size={16} />
          </button>
          <span className="w-10 text-center font-bold text-ink-950">{quantity}</span>
          <button
            type="button"
            onClick={() => onUpdate(quantity + 1)}
            className="flex h-14 w-12 items-center justify-center rounded-full hover:bg-white"
            aria-label="Increase quantity"
          >
            <Plus size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-600"
        >
          <Trash2 size={16} />
          Remove
        </button>
      </div>
    </article>
  );
}
