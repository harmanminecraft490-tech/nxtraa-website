"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  CreditCard,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import AnnouncementBar from "../components/layout/announcementbar";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/footer";
import ProductVisual from "../components/ui/productvisual";
import { useCart } from "../components/lib/cartcontext";
import { getProductById } from "../components/lib/products-store";

import { Suspense } from "react";

type RazorpayPaymentSuccess = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
};

type RazorpayOrderResponse = {
  error?: string;
  order?: RazorpayOrder;
};

type OrderResponse = {
  error?: string;
  order?: { id: string };
};

type SessionUser = {
  id: string;
  name: string | null;
  email: string | null;
};

type RazorpayOptions = {
  key: string | undefined;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayPaymentSuccess) => Promise<void>;
  prefill: {
    name: string;
    email?: string | null;
    contact: string;
  };
  theme: {
    color: string;
  };
};

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen min-h-dvh bg-canvas flex items-center justify-center">
        <div className="animate-spin h-8 w-8 text-accent border-4 border-t-transparent border-accent/20 rounded-full" />
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}

function CheckoutPageContent() {
  const router = useRouter();
  const { items, subtotal, deliveryFee, total, clearCart } = useCart();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [payment, setPayment] = useState("UPI");
  const [step, setStep] = useState<"address" | "payment">("address");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/me", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok || cancelled) {
          return;
        }

        const data = (await response.json()) as { user: SessionUser | null };
        if (!cancelled) {
          setUser(data.user);
          setAuthChecked(true);
          if (!data.user) {
            router.replace("/account/signin?next=/checkout");
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAuthChecked(true);
          router.replace("/account/signin?next=/checkout");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!authChecked) {
    return (
      <div className="min-h-screen min-h-dvh bg-canvas flex items-center justify-center">
        <div className="animate-spin h-8 w-8 text-accent border-4 border-t-transparent border-accent/20 rounded-full" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <AnnouncementBar />
        <Navbar />
        <main className="min-h-[60vh] bg-white">
          <div className="page-wrap flex flex-col items-center py-20 text-center">
            <h1 className="section-title text-ink-950">Nothing to checkout</h1>
            <p className="body-copy mt-4">Add items to your cart first.</p>
            <Link
              href="/shop"
              className="mt-8 rounded-full bg-accent px-8 py-3.5 text-sm font-bold text-white hover:bg-accent-deep transition-all duration-300 hover:shadow-[0_8px_24px_-8px_rgba(6,182,212,0.5)] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              Go to shop
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const handleRazorpayPayment = async () => {
    setPlacingOrder(true);

    try {
      // Create Razorpay order
      const orderResponse = await fetch("/api/payments/razorpay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Server derives the amount from these items — do not send a price.
          items,
          orderId: `order_${Date.now()}`,
        }),
      });

      const orderData = (await orderResponse.json()) as RazorpayOrderResponse;

      if (!orderResponse.ok || !orderData.order) {
        if (orderResponse.status === 401) {
          router.push("/account/signin?next=/checkout");
          return;
        }
        alert("Failed to initialize payment. Please try again.");
        return;
      }

      // Initialize Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Nxteraa",
        description: "Premium Mobile Accessories",
        order_id: orderData.order.id,
        handler: async (response: RazorpayPaymentSuccess) => {
          // Verify payment and place order
          const verifyResponse = await fetch("/api/orders", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              items,
              subtotal,
              deliveryFee,
              total,
              payment: "Razorpay",
              address: form,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });

          const data = (await verifyResponse.json()) as OrderResponse;

          if (verifyResponse.ok && data.order) {
            clearCart();
            router.push(`/order-success?id=${data.order.id}`);
          } else {
            if (verifyResponse.status === 401) {
              router.push("/account/signin?next=/checkout");
              return;
            }
            alert(data.error ?? "Order placement failed. Contact support.");
          }
        },
        prefill: {
          name: form.name || user?.name || "",
          email: user?.email,
          contact: form.phone,
        },
        theme: {
          color: "#06b6d4",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment initialization failed. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  const handlePlaceOrder = async () => {
    // For online payments, use Razorpay
    if (payment === "UPI" || payment === "Card") {
      if (!razorpayLoaded) {
        alert("Payment gateway not loaded. Please try again.");
        return;
      }
      await handleRazorpayPayment();
      return;
    }

    // For COD, place order directly
    setPlacingOrder(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items,
          subtotal,
          deliveryFee,
          total,
          payment,
          address: form,
        }),
      });

      const data = (await response.json()) as OrderResponse;

      if (!response.ok || !data.order) {
        if (response.status === 401) {
          router.push("/account/signin?next=/checkout");
          return;
        }
        alert(data.error ?? "We could not place your order. Please try again.");
        return;
      }

      clearCart();
      router.push(`/order-success?id=${data.order.id}`);
    } catch (error) {
      console.error("Order placement failed:", error);
      alert("We could not reach the server. Please check your connection and try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="min-h-screen min-h-dvh bg-canvas">
        <div className="page-wrap section-space !pt-10">
          <div className="section-header">
            <p className="eyebrow">Secure checkout</p>
            <h1 className="section-title mt-3 text-ink-950">Complete your order</h1>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-12">
            <div className="space-y-6">
              <div className="rounded-2xl border border-line-soft bg-white px-5 py-4 text-sm text-ink-600">
                <p className="font-bold text-ink-950">Signed in as {user?.email ?? "your account"}</p>
                <p className="mt-1">
                  Your order will be attached to your Nxteraa account so it appears in account history.
                </p>
              </div>

              {/* Step tabs */}
              <div className="flex gap-4 border-b border-line pb-4">
                <button
                  type="button"
                  onClick={() => setStep("address")}
                  className={`flex items-center gap-2 text-sm font-bold ${
                    step === "address" ? "text-ink-950" : "text-ink-400"
                  }`}
                >
                  <MapPin size={18} />
                  1. Address
                </button>
                <button
                  type="button"
                  className={`flex items-center gap-2 text-sm font-bold ${
                    step === "payment" ? "text-ink-950" : "text-ink-400"
                  }`}
                >
                  <CreditCard size={18} />
                  2. Payment
                </button>
              </div>

              {step === "address" ? (
                <section className="card-premium hover:!translate-y-0 space-y-6">
                  <h2 className="text-xl font-black text-ink-950">
                    Delivery address
                  </h2>
                  <div className="grid gap-5 sm:grid-cols-2">
                    {(
                      [
                        ["name", "Full name", "text"],
                        ["phone", "Phone number", "tel"],
                        ["address", "Full address", "text"],
                        ["city", "City", "text"],
                        ["pincode", "PIN code", "text"],
                      ] as const
                    ).map(([key, label, type]) => (
                      <div
                        key={key}
                        className={key === "address" ? "sm:col-span-2" : ""}
                      >
                        <label className="mb-2 block text-sm font-bold text-ink-700 pl-1">
                          {label}
                        </label>
                        <input
                          required
                          type={type}
                          value={form[key]}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, [key]: e.target.value }))
                          }
                          className="input-premium"
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep("payment")}
                    className="w-full sm:w-auto bg-accent text-white px-6 py-3 rounded-full font-bold hover:bg-accent-deep transition-all duration-300 inline-flex items-center justify-center gap-2 hover:shadow-[0_8px_24px_-8px_rgba(6,182,212,0.5)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                  >
                    Continue to payment
                    <ArrowRight size={16} />
                  </button>
                </section>
              ) : (
                <section className="card-premium hover:!translate-y-0 space-y-6">
                  <h2 className="text-xl font-black text-ink-950">
                    Payment method
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {["UPI", "Card", "COD"].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPayment(method)}
                        className={`rounded-2xl border p-5 text-left transition cursor-pointer ${
                          payment === method
                            ? "border-accent bg-accent-soft/50 shadow-[0_4px_12px_rgba(39,196,221,0.15)]"
                            : "border-line hover:border-line hover:bg-canvas"
                        }`}
                      >
                        <span className="text-sm font-bold text-ink-950">
                          {method}
                        </span>
                        <p className="mt-1 text-xs text-ink-500">
                          {method === "COD"
                            ? "Pay on delivery"
                            : "Pay securely online"}
                        </p>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setStep("address")}
                      className="text-sm font-bold text-ink-500 hover:text-ink-950 transition flex items-center gap-1.5"
                    >
                      <span>←</span> Back to address
                    </button>
                  </div>
                </section>
              )}
            </div>

            {/* Order summary sidebar */}
            <aside className="card-premium hover:!translate-y-0 h-fit space-y-6">
              <h2 className="text-xl font-black text-ink-950">Order summary</h2>

              <ul className="max-h-64 space-y-4 overflow-y-auto">
                {items.map((item) => {
                  const product = getProductById(item.productId);
                  return (
                    <li key={item.productId} className="flex gap-4">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-line-soft">
                        <ProductVisual
                          category={product.category}
                          model={product.model}
                          size="sm"
                          productId={product.id}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-bold text-ink-950">
                          {product.title}
                        </p>
                        <p className="mt-0.5 text-xs font-semibold text-ink-400">Qty: {item.quantity}</p>
                        <p className="mt-0.5 text-sm font-bold text-ink-950">
                          Rs. {product.price * item.quantity}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="space-y-3 border-t border-line-soft pt-5 text-sm font-bold text-ink-500">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-ink-950">Rs. {subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="text-ink-950">
                    {deliveryFee === 0 ? "Free" : `Rs. ${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between border-t border-line-soft pt-4">
                  <span className="text-ink-950">Total</span>
                  <span className="text-2xl font-black text-ink-950">
                    Rs. {total}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={
                  step !== "payment" ||
                  !form.name ||
                  !form.phone ||
                  placingOrder
                }
                className="btn-primary w-full disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed"
              >
                {placingOrder ? "Processing..." : `Pay Rs. ${total}`}
              </button>

              <p className="flex items-center justify-center gap-2 text-xs font-semibold text-ink-400">
                <ShieldCheck size={14} className="text-accent" />
                Secure checkout · 7-day replacement
              </p>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
