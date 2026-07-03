import Link from "next/link";
import { Package, User } from "lucide-react";

import AnnouncementBar from "../components/layout/announcementbar";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/footer";
import AccountAuthShell from "../components/account/accountauthshell";
import LogoutButton from "../components/account/logoutbutton";
import { auth } from "@/auth";
import { getOrdersForUser } from "@/lib/order-data";

type AccountPageProps = {
  searchParams: Promise<{
    next?: string;
    callbackUrl?: string;
    switch?: string;
  }>;
};

function getSafeRedirectPath(
  nextPath: string | undefined,
  callbackUrl: string | undefined,
) {
  if (nextPath?.startsWith("/")) {
    return nextPath;
  }

  if (callbackUrl) {
    try {
      const url = new URL(callbackUrl);
      return `${url.pathname}${url.search}${url.hash}`;
    } catch {
      if (callbackUrl.startsWith("/")) {
        return callbackUrl;
      }
    }
  }

  return "/";
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const params = await searchParams;
  const redirectTo = getSafeRedirectPath(params.next, params.callbackUrl);
  const session = await auth();
  const googleEnabled = Boolean(
    process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
  );
  const orders = session?.user?.id ? await getOrdersForUser(session.user.id) : [];

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="min-h-screen bg-canvas">
        <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8">
          {session?.user ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
              <section className="card-premium p-8">
                <div className="flex flex-col gap-5 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent">
                      <User size={32} />
                    </div>
                    <div>
                      <h1 className="text-3xl font-black text-ink-950">Welcome back</h1>
                      <p className="mt-1 text-ink-500">{session.user.name ?? session.user.email}</p>
                    </div>
                  </div>

                  <LogoutButton />
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-canvas p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-400">
                      Email
                    </p>
                    <p className="mt-3 text-lg font-bold text-ink-950">
                      {session.user.email}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-canvas p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-400">
                      Recent orders
                    </p>
                    <p className="mt-3 text-lg font-bold text-ink-950">{orders.length}</p>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="eyebrow">Order history</p>
                      <h2 className="mt-2 text-2xl font-black text-ink-950">
                        Your latest orders
                      </h2>
                    </div>
                    <Link
                      href="/track-order"
                      className="text-sm font-bold text-accent hover:underline"
                    >
                      Track any order
                    </Link>
                  </div>

                  {orders.length === 0 ? (
                    <div className="mt-6 rounded-2xl border border-dashed border-line bg-ink-50 p-6 text-sm text-ink-600">
                      No orders yet. When you place your first order while signed in, it
                      shows up here automatically.
                    </div>
                  ) : (
                    <div className="mt-6 space-y-4">
                      {orders.map((order) => (
                        <article
                          key={order.id}
                          className="card-premium hover:!translate-y-0"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex items-start gap-3">
                              <div className="mt-1 rounded-xl bg-accent-soft p-3 text-accent">
                                <Package size={20} />
                              </div>
                              <div>
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-400">
                                  Order ID
                                </p>
                                <p className="mt-2 text-lg font-extrabold text-ink-950">
                                  {order.id}
                                </p>
                                <p className="mt-1 text-sm text-ink-500">
                                  {new Date(order.createdAt).toLocaleDateString("en-IN")} &middot;{" "}
                                  {order.payment}
                                </p>
                              </div>
                            </div>
                            <div className="text-left sm:text-right">
                              <p className="text-sm font-medium text-ink-500">Total</p>
                              <p className="mt-1 text-xl font-extrabold text-ink-950">
                                Rs. {order.total}
                              </p>
                              <p className="mt-1 text-sm font-semibold capitalize text-signal">
                                {order.status}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-3">
                            <Link
                              href={`/track-order?id=${order.id}`}
                              className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white hover:bg-accent-deep transition-all duration-300 hover:shadow-[0_8px_20px_-6px_rgba(6,182,212,0.45)] active:scale-[0.97]"
                            >
                              Track order
                            </Link>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <aside className="space-y-6">
                <div className="card-premium p-8">
                  <p className="eyebrow">Profile</p>
                  <h2 className="mt-3 text-2xl font-black text-ink-950">
                    Account details
                  </h2>
                  <dl className="mt-6 space-y-5">
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-[0.2em] text-ink-400">
                        Name
                      </dt>
                      <dd className="mt-2 text-base font-bold text-ink-950">
                        {session.user.name ?? "Set from your next sign-in"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-[0.2em] text-ink-400">
                        Email
                      </dt>
                      <dd className="mt-2 text-base font-bold text-ink-950">
                        {session.user.email}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="card-premium p-8">
                  <p className="eyebrow">Quick links</p>
                  <div className="mt-6 space-y-3 text-sm font-bold">
                    <Link href="/shop" className="block text-ink-950 hover:text-accent">
                      Continue shopping
                    </Link>
                    <Link
                      href="/track-order"
                      className="block text-ink-950 hover:text-accent"
                    >
                      Track an order
                    </Link>
                    <Link href="/support" className="block text-ink-950 hover:text-accent">
                      Contact support
                    </Link>
                  </div>
                </div>
              </aside>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-[480px]">
              <AccountAuthShell
                redirectTo={redirectTo}
                googleEnabled={googleEnabled}
              />
              <p className="mt-6 text-center text-sm text-ink-500">
                {params.switch === "1" ? "Choose another account to continue. " : ""}
                <Link
                  href="/track-order"
                  className="font-bold text-accent hover:underline"
                >
                  Track order without signing in
                </Link>
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
