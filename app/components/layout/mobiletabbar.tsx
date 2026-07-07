"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingBag, Store, User } from "lucide-react";

import { useCart } from "../lib/cartcontext";
import { cn } from "../lib/utils";

const TABS = [
  { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  { href: "/shop", label: "Shop", icon: Store, match: (p: string) => p.startsWith("/shop") },
  { href: "/search", label: "Search", icon: Search, match: (p: string) => p.startsWith("/search") },
  { href: "/account", label: "Account", icon: User, match: (p: string) => p.startsWith("/account") },
];

/**
 * Native app–style bottom tab bar, shown only on phones. Hidden from lg+ where
 * the full navbar covers navigation.
 */
export default function MobileTabBar() {
  const pathname = usePathname() ?? "/";
  const { count, openDrawer } = useCart();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/90 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold transition-colors",
                active ? "text-accent" : "text-ink-400",
              )}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.4 : 1.9}
                className="transition-transform active:scale-90"
              />
              {tab.label}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={openDrawer}
          aria-label="Open cart"
          className="relative flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold text-ink-400 transition-colors active:text-accent"
        >
          <span className="relative">
            <ShoppingBag size={22} strokeWidth={1.9} className="transition-transform active:scale-90" />
            {count > 0 && (
              <span className="absolute -right-2 -top-1.5 grid h-[16px] min-w-[16px] place-items-center rounded-full bg-accent px-1 text-[9px] font-bold tabular-nums text-white">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </span>
          Cart
        </button>
      </div>
    </nav>
  );
}
