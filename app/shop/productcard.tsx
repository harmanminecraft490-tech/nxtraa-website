"use client";

import Link from "next/link";
import { Heart, Minus, Plus, ShoppingCart, Star, Trash2 } from "lucide-react";

import ProductVisual from "../components/ui/productvisual";
import { formatPrice, getDiscountPercent } from "../components/lib/product-types";

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
  const hasDiscount = oldPrice > price && oldPrice > 0;
  const discount = getDiscountPercent(price, oldPrice);
  const buyHref = `/buy?product=${id}`;
  const cartHref = `/buy?product=${id}&action=cart`;

  return (
    <article className="card-premium !p-0 flex flex-col h-full">
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-[20px] sm:rounded-t-[24px] border-b border-line-soft">
        {badge && (
          <span className="absolute left-3 top-3 z-10 max-w-[calc(100%-5rem)] truncate rounded-full bg-white/95 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-ink-950 shadow-sm backdrop-blur-sm sm:left-4 sm:top-4 sm:px-3 sm:py-1.5 sm:text-[10px]">
            {badge}
          </span>
        )}

        <Link
          href="/wishlist"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink-900 shadow-md transition-all duration-300 hover:bg-accent hover:text-white hover:scale-110 sm:right-4 sm:top-4 sm:h-10 sm:w-10"
          aria-label={`Add ${title} to wishlist`}
          onClick={(e) => e.stopPropagation()}
        >
          <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Link>

        <Link href={buyHref} className="block h-full">
          <ProductVisual category={category} model={model} size="md" hover productId={id} imageUrls={imageUrls} />
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:gap-4 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[9px] font-extrabold uppercase tracking-[0.2em] text-accent sm:text-[10px]">
            {category}
          </p>
          <div className="flex shrink-0 items-center gap-1 text-xs font-bold text-amber-500 sm:gap-1.5 sm:text-sm">
            <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="currentColor" />
            <span>{rating}</span>
          </div>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <Link href={buyHref} className="block">
            <h3 className="line-clamp-2 text-sm font-black leading-snug text-ink-950 transition-colors duration-300 hover:text-accent sm:text-lg">
              {title}
            </h3>
          </Link>
          <p className="text-xs font-medium text-ink-500 sm:text-sm">{model}</p>
        </div>

        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1.5 sm:gap-x-3 sm:gap-y-2">
          <span className="text-xl font-black tracking-tight text-ink-950 sm:text-2xl">
            Rs. {formatPrice(price)}
          </span>
          {hasDiscount && (
            <>
              <span className="text-[10px] font-semibold text-ink-400 line-through sm:text-xs">
                Rs. {formatPrice(oldPrice)}
              </span>
              <span className="rounded-full bg-accent-soft px-1.5 py-0.5 text-[9px] font-bold text-accent-deep sm:px-2 sm:py-1 sm:text-[10px]">
                {discount}% OFF
              </span>
            </>
          )}
        </div>

        <div className="mt-auto flex items-center gap-2 pt-1.5 sm:gap-3 sm:pt-2">
          <Link
            href={cartHref}
            className="h-9 flex-1 rounded-full flex items-center justify-center gap-1.5 text-xs font-bold border-2 border-accent bg-white text-accent hover:bg-accent hover:text-white transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:scale-[0.97] hover:shadow-[0_8px_20px_-6px_rgba(6,182,212,0.45)] sm:h-10 sm:gap-2 sm:text-sm"
            aria-label="Add to Cart"
          >
            <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Add to Cart</span>
            <span className="sm:hidden">Add</span>
          </Link>
          <Link
            href={buyHref}
            className="h-9 flex-1 rounded-full flex items-center justify-center text-xs font-bold bg-accent text-white hover:bg-accent-deep transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:scale-[0.97] hover:shadow-[0_8px_20px_-6px_rgba(6,182,212,0.45)] sm:h-10 sm:text-sm"
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
        <p className="pt-2 text-2xl font-black text-accent">Rs. {formatPrice(price)}</p>
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
