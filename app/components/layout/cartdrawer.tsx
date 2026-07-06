"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, X } from "lucide-react";

import ProductVisual from "../ui/productvisual";

import { useCart } from "../lib/cartcontext";
import { getProductById } from "../lib/products-store";
import { cn } from "../lib/utils";

export default function CartDrawer() {
  const {
    items,
    drawerOpen,
    closeDrawer,
    removeItem,
    updateQuantity,
    subtotal,
    deliveryFee,
    total,
  } = useCart();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[80] bg-black/40 transition-opacity duration-300",
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed right-0 top-0 z-[90] flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-out",
          drawerOpen ? "translate-x-0" : "translate-x-full",
        )}
        aria-hidden={!drawerOpen}
      >
        <div className="flex items-center justify-between border-b border-line-soft px-6 py-5">
          <h2 className="text-xl font-extrabold text-ink-950">Your Cart</h2>
          <button
            type="button"
            onClick={closeDrawer}
            className="icon-btn"
            aria-label="Close cart"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center">
              <p className="text-lg font-bold text-ink-950">Cart is empty</p>
              <p className="mt-2 text-sm text-ink-500">Add products to get started</p>
              <Link
                href="/shop"
                onClick={closeDrawer}
                className="mt-6 rounded-full bg-accent px-6 py-3 text-sm font-bold text-white hover:bg-accent-deep transition-all duration-300 hover:shadow-[0_8px_24px_-8px_rgba(6,182,212,0.5)] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                Shop now
              </Link>
            </div>
          ) : (
            <ul className="space-y-5">
              {items.map((item) => {
                const product = getProductById(item.productId);
                return (
                  <li
                    key={item.productId}
                    className="flex gap-4 border-b border-line-soft pb-5 last:border-0"
                  >
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
                      <ProductVisual
                        category={product.category}
                        model={product.model}
                        size="sm"
                        productId={product.id}
                      />
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <p className="line-clamp-2 text-sm font-bold leading-snug text-ink-950">
                        {product.title}
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-extrabold text-ink-950">
                          Rs. {product.price}
                        </span>
                        <span className="text-xs text-ink-400 line-through">
                          Rs. {product.oldPrice}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <div className="inline-flex h-9 items-center rounded-full border border-line bg-canvas">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="flex h-9 w-8 items-center justify-center"
                            aria-label="Decrease"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm font-bold">
                            {String(item.quantity).padStart(2, "0")}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="flex h-9 w-8 items-center justify-center"
                            aria-label="Increase"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="text-ink-400 hover:text-red-500"
                          aria-label="Remove"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {items.length > 0 && (
            <div className="mt-6 rounded-xl bg-canvas p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-ink-500">
                Coupon
              </p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-ink-800">
                  5% off prepaid orders
                </p>
                <button
                  type="button"
                  className="shrink-0 text-sm font-bold text-accent"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-line-soft px-6 py-5">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-ink-500">
                <span>Subtotal</span>
                <span className="font-semibold text-ink-900">Rs. {subtotal}</span>
              </div>
              <div className="flex justify-between text-ink-500">
                <span>Delivery</span>
                <span className="font-semibold text-ink-900">
                  {deliveryFee === 0 ? "Free" : `Rs. ${deliveryFee}`}
                </span>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-base font-bold text-ink-950">Total</span>
              <span className="text-2xl font-extrabold text-ink-950">Rs. {total}</span>
            </div>
            <Link
              href="/checkout"
              onClick={closeDrawer}
              className="mt-5 flex h-14 w-full items-center justify-center rounded-full bg-accent text-base font-bold text-white hover:bg-accent-deep transition-all duration-300 hover:shadow-[0_12px_32px_-10px_rgba(6,182,212,0.55)] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              Pay Now
            </Link>
            <Link
              href="/cart"
              onClick={closeDrawer}
              className="mt-3 block text-center text-sm font-semibold text-accent hover:underline"
            >
              View full cart
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
