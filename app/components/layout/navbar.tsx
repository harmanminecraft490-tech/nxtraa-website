"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";

import SmartSearchBar from "../ui/smartsearchbar";
import { useCart } from "../lib/cartcontext";
import MobileMenu from "./mobilemenu";
import CartDrawer from "./cartdrawer";
import ProfileMenu from "../account/profilemenu";
import { cn } from "../lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/collections", label: "Collections" },
  { href: "/support", label: "Support" },
];

export default function Navbar() {
  const { count, openDrawer } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-500",
          scrolled
            ? "border-b border-line bg-white/80 backdrop-blur-xl"
            : "border-b border-transparent bg-white/70 backdrop-blur-md",
        )}
      >
        <div className="page-wrap flex h-[68px] items-center justify-between gap-6">
          <Link href="/" aria-label="Nxteraa home" className="shrink-0">
            <Image
              src="/logo.svg"
              alt="Nxteraa"
              width={180}
              height={36}
              priority
              className="h-9 w-auto object-contain md:h-11"
              style={{ width: "auto" }}
            />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative rounded-full px-4 py-2 text-sm font-medium text-ink-700 transition hover:text-ink-950"
              >
                <span>{link.label}</span>
                <span className="absolute inset-x-4 bottom-1 h-px scale-x-0 bg-ink-950 transition-transform duration-500 group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>

          <div className="flex flex-1 items-center justify-end gap-2">
            <div className="hidden w-full max-w-[360px] lg:block">
              <SmartSearchBar />
            </div>

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="icon-btn lg:hidden"
              aria-label="Search"
            >
              <Search size={18} strokeWidth={1.75} />
            </button>

            <Link
              href="/wishlist"
              className="icon-btn hidden sm:inline-flex"
              aria-label="Wishlist"
            >
              <Heart size={18} strokeWidth={1.75} />
            </Link>

            <ProfileMenu />

            <button
              type="button"
              onClick={openDrawer}
              className="icon-btn relative"
              aria-label="Open cart"
            >
              <ShoppingBag size={18} strokeWidth={1.75} />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-ink-950 px-1 text-xs font-semibold tabular-nums text-white">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </button>

            <Link
              href="/shop"
              className="btn btn-primary btn-sm inline-flex"
            >
              Shop now
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="icon-btn lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={18} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-line-soft bg-white px-6 py-4 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <SmartSearchBar autoFocus />
              </div>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="icon-btn"
                aria-label="Close search"
              >
                <X size={18} strokeWidth={1.75} />
              </button>
            </div>
          </div>
        )}
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <CartDrawer />
    </>
  );
}
