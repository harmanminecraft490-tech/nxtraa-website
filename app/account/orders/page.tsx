import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, ShoppingBag, ArrowLeft } from "lucide-react";

import AnnouncementBar from "@/app/components/layout/announcementbar";
import Navbar from "@/app/components/layout/navbar";
import Footer from "@/app/components/layout/footer";
import { getSessionUser } from "@/lib/auth/session";
import { getOrdersForUser } from "@/lib/order-data";
import OrdersListClient from "./orders-list-client";

export const metadata: Metadata = {
  title: "My Orders",
  robots: { index: false, follow: false },
};

export default async function OrdersPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/account/signin?next=/account/orders");
  }

  const orders = await getOrdersForUser(user.id);

  return (
    <>
      <AnnouncementBar />
      <Navbar />

      <main className="min-h-screen min-h-dvh bg-canvas">
        <div className="page-wrap section-space !pt-10">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Link
                href="/account"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-500 hover:text-ink-950 transition mb-2"
              >
                <ArrowLeft size={14} />
                Back to account
              </Link>
              <h1 className="text-2xl font-black text-ink-950 sm:text-3xl">My Orders</h1>
              <p className="mt-1 text-sm text-ink-500">
                {orders.length} order{orders.length !== 1 ? "s" : ""} placed
              </p>
            </div>
            <Link
              href="/shop"
              className="rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-white hover:bg-accent-deep transition-all duration-300 hover:shadow-[0_8px_24px_-8px_rgba(6,182,212,0.5)] active:scale-[0.97] inline-flex items-center gap-2"
            >
              <ShoppingBag size={16} />
              Continue shopping
            </Link>
          </div>

          {/* Orders List */}
          {orders.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-line-soft bg-white p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                <Package size={26} />
              </div>
              <p className="mt-5 text-lg font-bold text-ink-950">No orders yet</p>
              <p className="mt-2 text-sm text-ink-500">
                When you place an order it will appear here.
              </p>
              <Link
                href="/shop"
                className="mt-6 inline-flex rounded-full bg-accent px-8 py-3.5 text-sm font-bold text-white hover:bg-accent-deep transition-all duration-300 hover:shadow-[0_8px_24px_-8px_rgba(6,182,212,0.5)] active:scale-[0.97]"
              >
                Start shopping
              </Link>
            </div>
          ) : (
            <OrdersListClient orders={orders} />
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
