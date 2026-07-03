"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Heart, ShoppingCart, Check } from "lucide-react";
import { useCart } from "./components/lib/cartcontext";
import { getProductById } from "./components/lib/products";

type ProductCardProps = {
  productId: number;
};

export default function ProductCard({ productId }: ProductCardProps) {
  const product = getProductById(productId);
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  if (!product) {
    return null;
  }

  const handleAddToCart = () => {
    addItem(product.id, 1, false);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const discount = Math.round(
    ((product.oldPrice - product.price) / product.oldPrice) * 100
  );

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "image": `https://nxtraa.online/product-images/${product.id}.jpg`, // Replace with your actual image URL structure
    "description": product.description || `Buy ${product.title} - premium mobile accessory from Nxteraa.`,
    "sku": product.id, // Use a real SKU if available
    "brand": {
      "@type": "Brand",
      "name": "Nxteraa"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://nxtraa.online/buy?product=${product.id}`,
      "priceCurrency": "INR",
      "price": product.price,
      "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(), // Valid for 1 year
      "itemCondition": "https://schema.org/NewCondition",
      "availability": "https://schema.org/InStock" // Or OutOfStock
    },
    // Add review and rating data when available
    // "review": { ... },
    // "aggregateRating": { ... }
  };

  return (
    <div className="card-premium !p-4 sm:!p-6 flex flex-col h-full group">
      {/* Image Section */}
      <div className="relative mb-4 aspect-square">
        <Link href={`/buy?product=${product.id}`} className="block w-full h-full overflow-hidden rounded-2xl bg-canvas shadow-inner border border-line-soft">
          <Image
            src={`https://nxtraa.online/product-images/${product.id}.jpg`}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 23vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={productId < 4} // Eager load the first few images
          />
        </Link>
        {product.badge && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-white/90 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-ink-950 shadow-sm border border-line-soft backdrop-blur-sm">
            {product.badge}
          </span>
        )}
        <button
          aria-label="Add to Wishlist"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink-400 shadow-sm border border-line-soft backdrop-blur-sm hover:text-red-500 hover:scale-110 active:scale-95 transition-all"
        >
          <Heart size={16} />
        </button>
      </div>

      {/* Details Section */}
      <div className="flex flex-col flex-grow">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent mb-1">
          {product.category}
        </span>
        <Link href={`/buy?product=${product.id}`}>
          <h3 className="text-base font-bold text-ink-950 hover:text-accent transition-colors leading-snug line-clamp-2">
            {product.title}
          </h3>
        </Link>
        <p className="text-xs text-ink-400 font-semibold mt-1">{product.model}</p>
      </div>

      {/* Price and Action Section */}
      <div className="mt-4 pt-4 border-t border-line-soft">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-ink-950">
              Rs. {product.price}
            </span>
            {product.oldPrice > product.price && (
              <span className="text-sm text-ink-400 line-through">
                Rs. {product.oldPrice}
              </span>
            )}
          </div>
          {discount > 0 && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold text-emerald-700 border border-emerald-100">
              {discount}% OFF
            </span>
          )}
        </div>
        <button
          onClick={handleAddToCart}
          disabled={isAdded}
          className={`btn w-full transition-all duration-300 ${
            isAdded
              ? "btn-success"
              : "btn-primary"
          }`}
        >
          {isAdded ? <Check size={18} /> : <ShoppingCart size={16} />}
          <span className="ml-2">{isAdded ? "Added to Cart" : "Add to Cart"}</span>
        </button>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
    </div>
  );
}