"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Package, Calendar, CreditCard } from "lucide-react";

import AnnouncementBar from "../components/layout/announcementbar";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/footer";
import type { Order } from "../components/lib/orders";

export default function OrderSuccessClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams ? searchParams.get("id") ?? "" : "";
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!orderId) {
      return;
    }

    let cancelled = false;

    async function loadOrder() {
      const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);

      if (!response.ok) {
        if (!cancelled) {
          setOrder(null);
        }
        return;
      }

      const data = (await response.json()) as { order: Order };

      if (!cancelled) {
        setOrder(data.order);
      }
    }

    void loadOrder();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="min-h-screen bg-white">
        <div className="page-wrap flex flex-col items-center py-20 text-center sm:py-24">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-600">
            <CheckCircle2 size={40} />
          </div>

          <h1 className="section-title mt-8 text-ink-950">Order placed!</h1>
          <p className="body-copy mt-4 max-w-md">
            Thank you for shopping with Nxteraa. Your order is confirmed and will
            ship within 1–2 business days.
          </p>

          {order && (
            <div className="mt-10 w-full max-w-md space-y-4 rounded-2xl border border-line bg-canvas p-6 text-left">
              <div className="flex items-center gap-3">
                <Package className="text-accent" size={22} />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-ink-500">
                    Order ID
                  </p>
                  <p className="text-lg font-extrabold text-ink-950">{order.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CreditCard className="text-accent" size={22} />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-ink-500">
                    Payment
                  </p>
                  <p className="text-lg font-extrabold text-ink-950">{order.payment}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="text-accent" size={22} />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-ink-500">
                    Placed on
                  </p>
                  <p className="text-lg font-extrabold text-ink-950">
                    {new Date(order.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-500">Total paid</span>
                <span className="font-bold text-ink-950">Rs. {order.total}</span>
              </div>
            </div>
          )}

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href={`/track-order?id=${orderId}`}
              className="rounded-full bg-accent px-8 py-3.5 text-sm font-bold text-white hover:bg-accent-deep transition-all duration-300 hover:shadow-[0_8px_24px_-8px_rgba(6,182,212,0.5)] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              Track order
            </Link>
            <Link
              href="/shop"
              className="rounded-full bg-accent px-8 py-3.5 text-sm font-bold text-white hover:bg-accent-deep transition-all duration-300 hover:shadow-[0_8px_24px_-8px_rgba(6,182,212,0.5)] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
