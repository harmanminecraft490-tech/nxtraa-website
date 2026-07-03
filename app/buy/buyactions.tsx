"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { ShoppingCart, ShoppingBag } from "lucide-react";

import { useCart } from "../components/lib/cartcontext";
import { cn } from "../components/lib/utils";

type BuyActionsProps = {
  productId: number;
  productTitle: string;
  price: number;
  oldPrice: number;
  startInCart?: boolean;
};

export default function BuyActions({
  productId,
  startInCart = false,
}: BuyActionsProps) {
  const router = useRouter();
  const { addItem, openDrawer } = useCart();

  useEffect(() => {
    if (startInCart) {
      addItem(productId, 1, true);
    }
  }, [startInCart, productId, addItem]);

  const handleAddToCart = () => {
    addItem(productId, 1, true);
  };

  const handleBuyNow = () => {
    addItem(productId, 1, false);
    router.push("/checkout");
  };

  return (
    <div className="grid grid-cols-2 gap-3 pt-2">
      <button
        type="button"
        onClick={handleAddToCart}
        className="h-12 text-sm font-bold gap-2 inline-flex items-center justify-center border-2 border-accent bg-white text-accent hover:bg-accent hover:text-white transition-all duration-300 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:scale-[0.97] hover:shadow-[0_8px_24px_-8px_rgba(6,182,212,0.5)]"
      >
        <ShoppingCart size={16} />
        Add to Cart
      </button>
      <button
        type="button"
        onClick={handleBuyNow}
        className="h-12 text-sm font-bold gap-2 inline-flex items-center justify-center bg-accent text-white hover:bg-accent-deep transition-all duration-300 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:scale-[0.97] hover:shadow-[0_8px_24px_-8px_rgba(6,182,212,0.5)]"
      >
        <ShoppingBag size={16} />
        Buy Now
      </button>
    </div>
  );
}
