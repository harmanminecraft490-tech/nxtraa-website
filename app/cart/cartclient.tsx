"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { 
  ArrowRight, 
  ShoppingBag, 
  Truck, 
  Trash2, 
  Heart, 
  Plus, 
  Minus, 
  ShieldCheck, 
  Clock, 
  Check, 
  RotateCcw, 
  Sparkles, 
  Tag 
} from "lucide-react";

import AnnouncementBar from "../components/layout/announcementbar";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/footer";
import { useCart } from "../components/lib/cartcontext";
import type { Product } from "../components/lib/product-types";
import { getProductById, useProducts } from "../components/lib/products-store";
import ProductVisual from "../components/ui/productvisual";

export default function CartPageClient() {
  const { 
    items, 
    subtotal, 
    updateQuantity, 
    removeItem, 
    clearCart,
    addItem
  } = useCart();
  const products = useProducts();

  // Local interactive states for premium feel
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [addedItems, setAddedItems] = useState<Record<number, boolean>>({});

  // Auto-dismiss toast notification
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Dynamic coupon discount based on subtotal
  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon === "WELCOME10") return Math.round(subtotal * 0.1);
    if (appliedCoupon === "NXTRAA20") return Math.round(subtotal * 0.2);
    return 0;
  }, [appliedCoupon, subtotal]);

  // Adjust delivery fee if coupon brings subtotal down
  const finalDeliveryFee = useMemo(() => {
    const discountedSubtotal = subtotal - couponDiscount;
    if (discountedSubtotal >= 999 || discountedSubtotal === 0) return 0;
    return 79;
  }, [subtotal, couponDiscount]);

  const finalTotal = useMemo(() => {
    const calculated = subtotal - couponDiscount + finalDeliveryFee;
    return Math.max(0, calculated);
  }, [subtotal, couponDiscount, finalDeliveryFee]);

  // Calculate sum of original differences (savings from original list price) plus coupon discount
  const totalSavings = useMemo(() => {
    const baseSavings = items.reduce((sum, item) => {
      const p = products.find((candidate) => candidate.id === item.productId);
      if (!p) return sum;
      const diff = Math.max(0, p.oldPrice - p.price);
      return sum + diff * item.quantity;
    }, 0);
    return baseSavings + couponDiscount;
  }, [items, couponDiscount, products]);

  // Handler for coupon codes
  const applyCode = (code: string) => {
    const cleanCode = code.toUpperCase().trim();
    if (cleanCode === "WELCOME10") {
      setAppliedCoupon("WELCOME10");
      setCouponError(null);
      setToast({ message: "Coupon WELCOME10 applied (10% discount).", type: "success" });
    } else if (cleanCode === "NXTRAA20") {
      setAppliedCoupon("NXTRAA20");
      setCouponError(null);
      setToast({ message: "Coupon NXTRAA20 applied (20% discount).", type: "success" });
    } else {
      setCouponError("Invalid coupon code. Try WELCOME10 or NXTRAA20.");
    }
  };

  const handleApplyCoupon = () => {
    if (!couponCode) {
      setCouponError("Please enter a coupon code.");
      return;
    }
    applyCode(couponCode);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setToast({ message: "Coupon removed.", type: "info" });
  };

  // Handler for premium checkout
  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      window.location.href = "/checkout";
    }, 1200);
  };

  // Recommended products list based on current cart items
  const recommendedProducts = useMemo(() => {
    if (items.length === 0) return [];
    const primaryProductId = items[0].productId;
    const primaryProduct = products.find((p) => p.id === primaryProductId);
    if (!primaryProduct) return [];
    
    const sameCategoryProducts = products
      .filter((p) => p.category === primaryProduct.category && p.id !== primaryProductId)
      .slice(0, 4);
    
    if (sameCategoryProducts.length >= 4) {
      return sameCategoryProducts;
    }
    
    const bestsellers = products
      .filter((p) => [9, 13, 20, 33, 44, 97, 100, 126].includes(p.id))
      .filter((p) => p.id !== primaryProductId)
      .slice(0, 8);
    
    const combined = [...sameCategoryProducts, ...bestsellers];
    const unique = Array.from(new Map(combined.map((p) => [p.id, p])).values());

    return unique.slice(0, 4);
  }, [items, products]);

  // Free shipping calculations
  const freeShippingThreshold = 999;
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingAmount = freeShippingThreshold - subtotal;

  if (items.length === 0) {
    return (
      <>
        <AnnouncementBar />
        <Navbar />
        <main className="min-h-[85vh] flex items-center bg-canvas py-12 sm:py-16 lg:py-20 px-5 sm:px-8 xl:px-12">
          <div className="max-w-[1600px] w-full mx-auto">
            <style>{`
              @keyframes orbit {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              @keyframes pulse-sphere {
                0%, 100% { transform: scale(1); filter: drop-shadow(0 0 15px rgba(39, 196, 221, 0.4)); }
                50% { transform: scale(1.08); filter: drop-shadow(0 0 25px rgba(39, 196, 221, 0.7)); }
              }
              .animate-orbit-ccw {
                animation: orbit 15s linear infinite reverse;
              }
              .animate-pulse-sphere {
                animation: pulse-sphere 4s ease-in-out infinite;
              }
            `}</style>
            
            <div className="rounded-[40px] bg-white border border-line-soft p-8 md:p-16 shadow-sm flex flex-col items-center justify-center text-center max-w-2xl mx-auto py-16 md:py-24">
              {/* Beautiful Custom SVG Animated Illustration */}
              <div className="relative w-48 h-48 flex items-center justify-center">
                {/* Outer Orbit */}
                <div className="absolute inset-0 border border-dashed border-line rounded-full animate-orbit-ccw pointer-events-none" />
                {/* Inner Orbit with nodes */}
                <div className="absolute inset-4 border border-accent-soft rounded-full animate-[spin_10s_linear_infinite] pointer-events-none">
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-accent shadow" />
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-emerald-400 shadow" />
                </div>
                {/* Sphere */}
                <div className="absolute w-24 h-24 rounded-full bg-gradient-to-tr from-accent to-indigo-400 flex items-center justify-center text-white shadow-xl animate-pulse-sphere">
                  <ShoppingBag size={42} strokeWidth={1.5} />
                </div>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-black text-ink-950 mt-8 tracking-tight">
                Your Shopping Cart is Empty
              </h1>
              <p className="text-sm font-semibold text-ink-500 mt-4 max-w-md leading-relaxed">
                Explore Nxteraa&apos;s premium collection of super-fast chargers, premium earbuds, high-capacity power banks, and other high-end accessories.
              </p>
              <Link
                href="/shop"
                className="mt-8 inline-flex h-14 items-center gap-2 rounded-full bg-accent px-10 font-bold text-white shadow-md hover:bg-accent-deep hover:scale-105 hover:shadow-[0_12px_32px_-10px_rgba(6,182,212,0.55)] active:scale-95 transition-all duration-300"
              >
                Start Shopping
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <AnnouncementBar />
      <Navbar />

      <main className="min-h-screen min-h-dvh bg-canvas py-12 sm:py-16 lg:py-20 px-5 sm:px-8 xl:px-12">
        <style>{`
          @keyframes slide-up {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .animate-toast {
            animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}</style>

        <div className="max-w-[1600px] mx-auto space-y-12">
          
          {/* Header section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-line-soft">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">Your Bag</p>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-ink-950">Shopping Cart</h1>
              <p className="text-sm font-semibold text-gray-500">
                You have <span className="text-accent font-extrabold">{items.length}</span> product{items.length !== 1 ? 's' : ''} ready for checkout.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/shop"
                className="inline-flex h-11 items-center justify-center px-6 rounded-full bg-accent text-xs font-bold text-white hover:bg-accent-deep active:scale-95 transition-all duration-300 hover:shadow-[0_8px_20px_-6px_rgba(6,182,212,0.45)]"
              >
                Continue Shopping
              </Link>
              <button 
                type="button" 
                onClick={() => {
                  clearCart();
                  setToast({ message: "Cart cleared completely.", type: "info" });
                }}
                className="inline-flex h-11 items-center justify-center px-6 rounded-full bg-red-50 text-xs font-bold text-red-600 hover:bg-red-100/60 active:scale-95 transition-all duration-200"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Free Shipping Bar */}
          <div className="rounded-[32px] bg-white border border-line-soft p-6 md:p-8 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm font-bold text-ink-950">
              <span className="flex items-center gap-2">
                <Truck className="text-accent" size={18} />
                {progressPercent >= 100 ? (
                  <span className="text-emerald-600 flex items-center gap-2">
                    <Check size={16} strokeWidth={3} />
                    You have unlocked Free Shipping!
                  </span>
                ) : (
                  <span>Free Shipping on orders above Rs. 999</span>
                )}
              </span>
              {progressPercent < 100 && (
                <span className="text-gray-500 text-xs sm:text-sm">
                  You are only <span className="text-accent font-extrabold">Rs. {remainingAmount}</span> away from Free Shipping
                </span>
              )}
            </div>
            <div className="relative w-full h-3 bg-mist rounded-full overflow-hidden shadow-inner">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent to-emerald-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Dual Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-12 items-start">
            
            {/* Left Side: Shopping Cart items (70%) */}
            <div className="lg:col-span-7 space-y-8">
              {items.map((item) => {
                const product = getProductById(item.productId);
                const discount = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
                
                return (
                  <article 
                    key={item.productId} 
                    className="card-premium !p-8 hover:!translate-y-0"
                  >
                    <div className="flex flex-col gap-6 md:grid md:grid-cols-[140px_1fr] lg:grid-cols-[140px_2.2fr_1.2fr_1.2fr_1fr] md:gap-8 items-center">
                      
                      {/* Product Image Wrapper */}
                      <div className="mx-auto md:mx-0 w-[140px] h-[140px] shrink-0 overflow-hidden rounded-2xl shadow-sm border border-line-soft bg-canvas relative">
                        <Link href={`/buy?product=${product.id}`} className="block w-full h-full">
                          <div className="w-full h-full transition-transform duration-500 group-hover:scale-110">
                            <ProductVisual category={product.category} model={product.model} size="md" productId={product.id} imageUrls={product.imageUrls} />
                          </div>
                        </Link>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0 space-y-2 text-center md:text-left">
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                            {product.category}
                          </span>
                          <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            In Stock
                          </span>
                        </div>
                        <Link href={`/buy?product=${product.id}`} className="block">
                          <h3 className="text-xl font-bold tracking-tight text-ink-950 hover:text-accent transition-colors leading-tight line-clamp-1">
                            {product.title}
                          </h3>
                        </Link>
                        <p className="text-sm font-semibold text-ink-500">{product.model}</p>
                        
                        <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1 text-xs text-ink-500 pt-1">
                          <span className="flex items-center gap-1 font-semibold">
                            <ShieldCheck size={14} className="text-ink-400" />
                            1 Year Warranty
                          </span>
                          <span className="flex items-center gap-1 font-semibold">
                            <Truck size={14} className="text-emerald-500" />
                            Fast Delivery
                          </span>
                        </div>
                      </div>

                      {/* Pricing Block */}
                      <div className="flex flex-col items-center md:items-start lg:items-center justify-center min-w-[120px]">
                        <span className="text-3xl font-black text-ink-950 tracking-tight">
                          Rs. {product.price}
                        </span>
                        {product.oldPrice > product.price && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-semibold text-ink-400 line-through">
                              Rs. {product.oldPrice}
                            </span>
                            <span className="rounded-full bg-green-50 px-2 py-1 text-[10px] font-extrabold text-green-700 uppercase">
                              {discount}% OFF
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex justify-center min-w-[130px]">
                        <div className="inline-flex h-14 items-center rounded-full border border-line bg-canvas">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="flex h-14 w-12 items-center justify-center rounded-full hover:bg-white hover:text-ink-950"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-10 text-center font-bold text-ink-950">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="flex h-14 w-12 items-center justify-center rounded-full hover:bg-white hover:text-ink-950"
                            aria-label="Increase quantity"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-center items-center gap-2 min-w-[120px]">
                        <button
                          type="button"
                          onClick={() => {
                            removeItem(product.id);
                            setToast({ message: `${product.title} removed from cart.`, type: "info" });
                          }}
                          className="flex h-11 w-11 items-center justify-center rounded-full border border-line-soft bg-white text-ink-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50/20 active:scale-95 transition-all duration-200"
                          title="Remove from cart"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setToast({ message: `${product.title} saved for later.`, type: "success" });
                          }}
                          className="flex h-11 w-11 items-center justify-center rounded-full border border-line-soft bg-white text-ink-400 hover:text-blue-500 hover:border-blue-100 hover:bg-blue-50/20 active:scale-95 transition-all duration-200"
                          title="Save for later"
                        >
                          <Clock size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            removeItem(product.id);
                            setToast({ message: `${product.title} moved to Wishlist.`, type: "success" });
                          }}
                          className="flex h-11 w-11 items-center justify-center rounded-full border border-line-soft bg-white text-ink-400 hover:text-pink-500 hover:border-pink-100 hover:bg-pink-50/20 active:scale-95 transition-all duration-200"
                          title="Move to Wishlist"
                        >
                          <Heart size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setToast({ message: `Added ${product.title} to comparison.`, type: "info" });
                          }}
                          className="flex h-11 w-11 items-center justify-center rounded-full border border-line-soft bg-white text-ink-400 hover:text-accent hover:border-accent-soft hover:bg-accent-soft/20 active:scale-95 transition-all duration-200"
                          title="Compare product"
                        >
                          <RotateCcw size={15} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Right Side: Order Summary sticky column (30%) */}
            <div className="lg:col-span-3 space-y-8">
              <aside className="sticky top-24 space-y-8">
                
                {/* Order Summary Card */}
                <div className="card-premium hover:!translate-y-0 space-y-6">
                  <h2 className="text-2xl font-black text-ink-950 tracking-tight">Order Summary</h2>
                  
                  <div className="space-y-4 text-sm font-bold text-ink-500">
                    <div className="flex justify-between items-center">
                      <span>Subtotal</span>
                      <span className="text-ink-950 font-black">Rs. {subtotal}</span>
                    </div>
                    
                    {appliedCoupon && (
                      <div className="flex justify-between items-center text-emerald-600">
                        <span className="flex items-center gap-2 font-bold uppercase tracking-wide text-xs">
                          <Tag size={14} />
                          Coupon ({appliedCoupon})
                        </span>
                        <span>-Rs. {couponDiscount}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span>Delivery</span>
                      <span className="text-gray-950 font-black">
                        {finalDeliveryFee === 0 ? (
                          <span className="text-emerald-600 font-extrabold uppercase text-xs tracking-wider">FREE</span>
                        ) : (
                          `Rs. ${finalDeliveryFee}`
                        )}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>Taxes & duties</span>
                      <span className="text-ink-400 text-xs font-semibold uppercase tracking-wide">Inclusive (18% GST)</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>Estimated Arrival</span>
                      <span className="text-ink-950 font-bold">Friday, Jul 3</span>
                    </div>
                  </div>
                  
                  <hr className="border-line-soft" />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-base font-bold text-ink-900">Total Amount</span>
                      <span className="text-3xl font-black text-ink-950 tracking-tight">
                        Rs. {finalTotal}
                      </span>
                    </div>
                    {totalSavings > 0 && (
                      <p className="text-right text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full inline-block w-full text-center mt-1 border border-emerald-100">
                        ✨ You save Rs. {totalSavings} on this order!
                      </p>
                    )}
                  </div>
                  
                  {/* Coupon Application Box */}
                  <div className="space-y-3 pt-2">
                    <label htmlFor="coupon-input" className="text-xs font-extrabold uppercase tracking-widest text-ink-400 block pl-1">
                      Discount Code
                    </label>
                    <div className="relative flex items-center bg-canvas border border-line rounded-full h-14 p-1 focus-within:ring-4 focus-within:ring-accent/15 transition-all">
                      <input
                        id="coupon-input"
                        type="text"
                        placeholder="Promo code (e.g. WELCOME10)"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value);
                          setCouponError(null);
                        }}
                        className="w-full pl-5 pr-2 bg-transparent text-sm font-semibold text-ink-950 placeholder-ink-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="h-12 px-6 rounded-full bg-accent text-xs font-bold text-white hover:bg-accent-deep transition-all duration-300 hover:shadow-[0_8px_20px_-6px_rgba(6,182,212,0.45)] active:scale-[0.97]"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-xs font-bold text-red-500 pl-3">{couponError}</p>
                    )}
                    {appliedCoupon && (
                      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold px-4 py-2.5 rounded-2xl">
                        <span>Coupon successfully applied!</span>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-emerald-600 hover:text-emerald-950 font-black text-sm transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                    
                    {/* Quick Suggestions */}
                    {!appliedCoupon && (
                      <div className="flex flex-wrap gap-2 pt-1 pl-1">
                        <button
                          type="button"
                          onClick={() => {
                            setCouponCode("WELCOME10");
                            setTimeout(() => applyCode("WELCOME10"), 100);
                          }}
                          className="text-[10px] font-extrabold tracking-wide uppercase bg-accent-soft/50 border border-accent-soft text-accent hover:bg-accent-soft px-3 py-1.5 rounded-full transition-colors"
                        >
                          WELCOME10
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCouponCode("NXTRAA20");
                            setTimeout(() => applyCode("NXTRAA20"), 100);
                          }}
                          className="text-[10px] font-extrabold tracking-wide uppercase bg-accent-soft/50 border border-accent-soft text-accent hover:bg-accent-soft px-3 py-1.5 rounded-full transition-colors"
                        >
                          NXTRAA20
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Checkout Button */}
                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="btn-primary w-full gap-2 text-base"
                  >
                    {isCheckingOut ? (
                      <div className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Processing Checkout...</span>
                      </div>
                    ) : (
                      <>
                        <span>Pay Now</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                  
                  {/* Payment Methods */}
                  <div className="space-y-3 pt-4 border-t border-line-soft">
                    <p className="text-center text-[10px] font-extrabold uppercase tracking-widest text-ink-400">
                      100% Secure Payment Methods
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {["Visa", "Mastercard", "RuPay", "UPI", "Paytm", "PhonePe", "Google Pay", "Apple Pay"].map((method) => (
                        <div 
                          key={method} 
                          className="flex h-10 items-center justify-center rounded-xl border border-line-soft bg-white p-1 text-[10px] font-bold text-ink-500 shadow-sm hover:border-accent/30 hover:bg-accent/5 transition-colors cursor-default"
                          title={method}
                        >
                          <span className="truncate">{method}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { title: "Secure Payment", desc: "PCI-DSS Compliant", icon: ShieldCheck, color: "text-accent bg-accent-soft border-accent-soft" },
                    { title: "7 Day Replacement", desc: "Easy returns", icon: RotateCcw, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
                    { title: "1 Year Warranty", desc: "Brand authorized", icon: Sparkles, color: "text-amber-600 bg-amber-50 border-amber-100" },
                    { title: "Fast Delivery", desc: "Dispatch in 24 hrs", icon: Truck, color: "text-blue-600 bg-blue-50 border-blue-100" }
                  ].map((badge) => {
                    const Icon = badge.icon;
                    return (
                      <div 
                        key={badge.title} 
                        className="rounded-2xl border border-line-soft bg-white p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-300"
                      >
                        <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${badge.color}`}>
                          <Icon size={18} />
                        </div>
                        <div className="mt-3">
                          <h4 className="text-xs font-extrabold text-ink-950 leading-tight">{badge.title}</h4>
                          <p className="text-[10px] text-ink-400 font-semibold mt-0.5">{badge.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Made in India Card */}
                  <div className="col-span-2 rounded-2xl border border-line-soft bg-gradient-to-r from-orange-50/50 via-white to-green-50/50 p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-orange-100 bg-orange-50/55 text-orange-600 font-black text-sm">
                        🇮🇳
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-ink-950 leading-tight">Made in India</h4>
                        <p className="text-[10px] text-ink-400 font-semibold mt-0.5">Designed and engineered locally</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black tracking-widest text-orange-600/80 uppercase">Atmanirbhar</span>
                  </div>
                </div>

              </aside>
            </div>

          </div>

          {/* Recommended Section (You May Also Like) */}
          {recommendedProducts.length > 0 && (
            <div className="pt-16 border-t border-line-soft space-y-8">
              <div className="text-center md:text-left space-y-2">
                <h2 className="text-3xl font-black text-ink-950 tracking-tight">You May Also Like</h2>
                <p className="text-sm font-semibold text-ink-500">Handpicked additions to complement your dynamic setup.</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
                {recommendedProducts.map((recProduct: Product) => {
                  return (
                    <div 
                      key={recProduct.id}
                      className="card-premium !p-6 flex flex-col justify-between h-full"
                    >
                      <div className="relative aspect-[5/4] rounded-2xl overflow-hidden shadow-sm border border-line-soft bg-canvas mb-5">
                        {recProduct.badge && (
                          <span className="absolute left-3 top-3 z-10 rounded-full bg-white/95 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-ink-950 shadow-sm border border-line-soft">
                            {recProduct.badge}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setToast({ message: `Saved ${recProduct.title} to wishlist.`, type: "success" });
                          }}
                          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink-400 shadow-sm border border-line-soft hover:text-red-500 hover:scale-110 active:scale-95 transition-all"
                          aria-label="Add to Wishlist"
                        >
                          <Heart size={14} />
                        </button>
                        <Link href={`/buy?product=${recProduct.id}`} className="block h-full w-full">
                          <div className="w-full h-full transition-transform duration-500 group-hover:scale-105">
                            <ProductVisual category={recProduct.category} model={recProduct.model} size="sm" productId={recProduct.id} imageUrls={recProduct.imageUrls} />
                          </div>
                        </Link>
                      </div>
                      
                      <div className="space-y-2 flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent block">
                          {recProduct.category}
                        </span>
                        <Link href={`/buy?product=${recProduct.id}`} className="block">
                          <h3 className="text-base font-bold text-ink-950 hover:text-accent transition-colors leading-snug line-clamp-1">
                            {recProduct.title}
                          </h3>
                        </Link>
                        <p className="text-xs text-ink-400 font-semibold">{recProduct.model}</p>
                        
                        {/* Rating */}
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                          <span>★</span>
                          <span>{recProduct.rating}</span>
                        </div>
                      </div>
                      
                      {/* Price and Add button */}
                      <div className="mt-4 pt-4 border-t border-line-soft flex items-center justify-between gap-3">
                        <div className="flex flex-col">
                          <span className="text-lg font-black text-ink-950">Rs. {recProduct.price}</span>
                          {recProduct.oldPrice > recProduct.price && (
                            <span className="text-[10px] text-ink-400 font-bold line-through">Rs. {recProduct.oldPrice}</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            addItem(recProduct.id, 1, false);
                            setAddedItems(prev => ({ ...prev, [recProduct.id]: true }));
                            setToast({ message: `${recProduct.title} added to cart.`, type: "success" });
                            setTimeout(() => {
                              setAddedItems(prev => ({ ...prev, [recProduct.id]: false }));
                            }, 1500);
                          }}
                          className={`btn-primary !h-11 px-5 text-xs font-extrabold ${
                            addedItems[recProduct.id] 
                              ? "bg-emerald-500 border-emerald-500 shadow-emerald-200 text-white" 
                              : ""
                          }`}
                        >
                          {addedItems[recProduct.id] ? "Added ✓" : "Quick Add"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />

      {/* Modern Luxury Toast Notifications */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-2xl bg-ink-950 px-6 py-4 shadow-2xl border border-ink-800 text-white animate-toast">
          {toast.type === 'success' ? (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Check size={14} />
            </div>
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white">
              <Sparkles size={14} />
            </div>
          )}
          <p className="text-sm font-semibold tracking-wide">{toast.message}</p>
        </div>
      )}
    </>
  );
}
