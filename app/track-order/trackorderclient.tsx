"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Package, Search } from "lucide-react";

import AnnouncementBar from "../components/layout/announcementbar";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/footer";
import {
  ORDER_STEPS,
  type Order,
} from "../components/lib/orders";
import { getProductById } from "../components/lib/products";

export default function TrackOrderClient() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get("id") ?? "";
  const [orderId, setOrderId] = useState(initialOrderId);
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchOrder = async (id: string) => {
    const trimmed = id.trim();

    if (!trimmed) {
      setOrder(undefined);
      setSearched(true);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(trimmed)}`);

      if (!response.ok) {
        setOrder(undefined);
        setSearched(true);
        return;
      }

      const data = (await response.json()) as { order: Order };
      setOrder(data.order);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderId) {
      const timer = window.setTimeout(() => {
        void fetchOrder(initialOrderId);
      }, 0);

      return () => window.clearTimeout(timer);
    }
  }, [initialOrderId]);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    void fetchOrder(orderId);
  };

  const currentStep = order
    ? ORDER_STEPS.findIndex((s) => s.key === order.status)
    : -1;

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="min-h-screen bg-canvas">
        <div className="page-wrap section-space !pt-12">
          <div className="section-header max-w-xl">
            <p className="eyebrow">Track order</p>
            <h1 className="section-title mt-3 text-ink-950">Where is my order?</h1>
            <p className="body-copy mt-4">
              Enter your order ID from the confirmation page or email.
            </p>
          </div>

          <form
            onSubmit={handleTrack}
            className="mt-8 max-w-xl rounded-2xl border border-line bg-white p-6 sm:p-8"
          >
            <label className="mb-3 block text-sm font-bold text-ink-950">
              Order ID
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. NX-2026-12345"
                className="input-premium flex-1"
              />
              <button
                type="submit"
                className="flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 text-sm font-bold text-white hover:bg-accent-deep transition-all duration-300 hover:shadow-[0_8px_20px_-6px_rgba(6,182,212,0.45)] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                <Search size={18} />
                {loading ? "Tracking..." : "Track"}
              </button>
            </div>
          </form>

          {searched && !order && (
            <p className="mt-6 text-sm font-medium text-red-600">
              Order not found. Check your order ID and try again.
            </p>
          )}

          {order && (
            <div className="mt-10 max-w-2xl space-y-8 rounded-2xl border border-line bg-white p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <Package className="mt-1 shrink-0 text-accent" size={24} />
                <div>
                  <p className="text-sm font-bold text-ink-500">Order {order.id}</p>
                  <p className="mt-1 text-lg font-extrabold text-ink-950">
                    Rs. {order.total} &middot; {order.payment}
                  </p>
                  <p className="mt-1 text-sm text-ink-500">
                    Placed on {new Date(order.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {ORDER_STEPS.map((step, index) => {
                  const done = index <= currentStep;
                  return (
                    <div key={step.key} className="flex items-center gap-4">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          done ? "bg-signal text-white" : "bg-ink-100 text-ink-400"
                        }`}
                      >
                        {done ? <CheckCircle2 size={16} /> : index + 1}
                      </div>
                      <span
                        className={`text-sm font-bold ${
                          done ? "text-ink-950" : "text-ink-400"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <ul className="space-y-3 border-t border-line pt-6">
                {order.items.map((item) => {
                  const product = getProductById(item.productId);
                  return (
                    <li
                      key={item.productId}
                      className="flex justify-between text-sm"
                    >
                      <span className="font-medium text-ink-700">
                        {product.title} &times; {item.quantity}
                      </span>
                      <span className="font-bold text-ink-950">
                        Rs. {product.price * item.quantity}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <Link
                href="/support"
                className="inline-flex text-sm font-bold text-accent hover:underline"
              >
                Need help? Contact support &rarr;
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
