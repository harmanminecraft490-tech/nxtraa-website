import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, ShoppingBag, ClipboardList } from "lucide-react";

import AnnouncementBar from "../components/layout/announcementbar";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/footer";
import SignOutButton from "../components/account/signoutbutton";
import { getSessionUser } from "@/lib/auth/session";
import { getOrdersForUser } from "@/lib/order-data";

export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/account/signin?next=/account");
  }

  const orders = await getOrdersForUser(user.id);

  return (
    <>
      <AnnouncementBar />
      <Navbar />

      <main className="min-h-screen min-h-dvh bg-canvas">
        <div className="page-wrap section-space !pt-10">
          <div className="section-header flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Account</p>
              <h1 className="section-title mt-3 text-ink-950">
                Hi, {user.name ?? user.email ?? "there"}
              </h1>
              <p className="body-copy mt-3">{user.email}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/account/orders" className="btn btn-primary">
                <ClipboardList size={16} />
                My Orders
              </Link>
              <Link href="/shop" className="btn btn-primary">
                <ShoppingBag size={16} />
                Continue shopping
              </Link>
              <SignOutButton />
            </div>
          </div>

          <div className="mt-10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink-950">Recent orders</h2>
              {orders.length > 0 && (
                <Link
                  href="/account/orders"
                  className="text-sm font-bold text-accent hover:underline"
                >
                  View all orders →
                </Link>
              )}
            </div>

            {orders.length === 0 ? (
              <div className="mt-6 rounded-3xl border border-line-soft bg-white p-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                  <Package size={26} />
                </div>
                <p className="mt-5 text-lg font-bold text-ink-950">No orders yet</p>
                <p className="mt-2 text-sm text-ink-500">
                  When you place an order it will appear here.
                </p>
                <Link href="/shop" className="btn btn-primary mt-6">
                  Start shopping
                </Link>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {orders.slice(0, 3).map((order) => (
                  <Link
                    key={order.id}
                    href={`/track-order?id=${encodeURIComponent(order.id)}`}
                    className="card-premium flex items-center justify-between gap-4 !p-5"
                  >
                    <div>
                      <p className="font-bold text-ink-950">{order.id}</p>
                      <p className="mt-1 text-sm text-ink-500">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        · {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-ink-950">
                        Rs. {order.total.toLocaleString("en-IN")}
                      </p>
                      <span className="mt-1 inline-block rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-accent-deep">
                        {order.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
