"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Package,
  Calendar,
  CreditCard,
  Truck,
  Download,
  ArrowRight,
} from "lucide-react";

import AnnouncementBar from "../components/layout/announcementbar";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/footer";
import type { Order } from "../components/lib/orders";

export default function OrderSuccessClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams ? searchParams.get("id") ?? "" : "";
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadOrder() {
      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);

        if (!response.ok) {
          if (!cancelled) {
            setOrder(null);
            setLoading(false);
          }
          return;
        }

        const data = (await response.json()) as { order: Order };

        if (!cancelled) {
          setOrder(data.order);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setOrder(null);
          setLoading(false);
        }
      }
    }

    void loadOrder();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  // Calculate estimated delivery (3-5 business days from order date)
  const getEstimatedDelivery = () => {
    if (!order) return "";
    const date = new Date(order.createdAt);
    date.setDate(date.getDate() + 5);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="min-h-screen min-h-dvh bg-white">
        <div className="page-wrap flex flex-col items-center py-20 text-center sm:py-24">
          {/* Success Animation */}
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg shadow-green-200">
              <CheckCircle2 size={48} strokeWidth={2.5} />
            </div>
            <div className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-white text-sm font-bold shadow-md">
              ✓
            </div>
          </div>

          <h1 className="mt-8 text-3xl font-black text-ink-950 sm:text-4xl">
            Payment Successful!
          </h1>
          <p className="body-copy mt-4 max-w-md">
            Thank you for shopping with Nxteraa. Your order has been confirmed
            and is being prepared for dispatch.
          </p>

          {loading ? (
            <div className="mt-10 w-full max-w-md">
              <div className="animate-pulse space-y-4 rounded-2xl border border-line bg-canvas p-6">
                <div className="h-4 w-32 rounded bg-ink-100" />
                <div className="h-4 w-48 rounded bg-ink-100" />
                <div className="h-4 w-24 rounded bg-ink-100" />
              </div>
            </div>
          ) : order ? (
            <div className="mt-10 w-full max-w-md space-y-4 rounded-2xl border border-line bg-canvas p-6 text-left">
              {/* Order Number */}
              <div className="flex items-center gap-3">
                <Package className="text-accent" size={22} />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-ink-500">
                    Order Number
                  </p>
                  <p className="text-lg font-extrabold text-ink-950">{order.id}</p>
                </div>
              </div>

              {/* Payment ID */}
              {order.razorpayPaymentId && (
                <div className="flex items-center gap-3">
                  <CreditCard className="text-accent" size={22} />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-ink-500">
                      Payment ID
                    </p>
                    <p className="text-sm font-bold text-ink-950 font-mono">
                      {order.razorpayPaymentId}
                    </p>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div className="flex items-center gap-3">
                <CreditCard className="text-accent" size={22} />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-ink-500">
                    Payment Method
                  </p>
                  <p className="text-lg font-extrabold text-ink-950">
                    {order.payment}
                    {order.paymentStatus === "PAID" && (
                      <span className="ml-2 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
                        Paid
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Amount */}
              <div className="flex items-center gap-3">
                <Package className="text-accent" size={22} />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-ink-500">
                    Amount Paid
                  </p>
                  <p className="text-lg font-extrabold text-ink-950">
                    Rs. {order.total.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Estimated Delivery */}
              <div className="flex items-center gap-3">
                <Truck className="text-accent" size={22} />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-ink-500">
                    Estimated Delivery
                  </p>
                  <p className="text-lg font-extrabold text-ink-950">
                    {getEstimatedDelivery()}
                  </p>
                </div>
              </div>

              {/* Placed On */}
              <div className="flex items-center gap-3">
                <Calendar className="text-accent" size={22} />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-ink-500">
                    Placed on
                  </p>
                  <p className="text-lg font-extrabold text-ink-950">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Order Items Summary */}
              <div className="border-t border-line-soft pt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-2">
                  Items ({order.items.length})
                </p>
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm py-1">
                    <span className="text-ink-600">
                      Product #{item.productId} × {item.quantity}
                    </span>
                    <span className="font-bold text-ink-950">
                      Rs. {item.quantity * 499}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-10 w-full max-w-md rounded-2xl border border-line bg-canvas p-6 text-center">
              <p className="text-ink-500">Order details could not be loaded.</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href={`/track-order?id=${orderId}`}
              className="rounded-full bg-accent px-8 py-3.5 text-sm font-bold text-white hover:bg-accent-deep transition-all duration-300 hover:shadow-[0_8px_24px_-8px_rgba(6,182,212,0.5)] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 inline-flex items-center gap-2"
            >
              <Truck size={16} />
              Track order
            </Link>
            <Link
              href="/shop"
              className="rounded-full bg-white border-2 border-accent px-8 py-3.5 text-sm font-bold text-accent hover:bg-accent hover:text-white transition-all duration-300 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 inline-flex items-center gap-2"
            >
              Continue shopping
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Support Note */}
          <p className="mt-8 text-xs text-ink-400">
            A confirmation has been sent to your registered email.{" "}
            <Link href="/support" className="text-accent hover:underline">
              Need help? Contact support
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
