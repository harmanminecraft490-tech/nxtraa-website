"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ChevronRight, X } from "lucide-react";

import { cn } from "../lib/utils";
import ProfileMenu from "../account/profilemenu";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
};

const SECTIONS: { heading?: string; items: { href: string; label: string; description?: string }[] }[] = [
  {
    items: [
      { href: "/", label: "Home", description: "New collection 2026" },
      { href: "/shop", label: "Shop all", description: "Premium mobile accessories" },
      { href: "/collections", label: "Collections", description: "Shop by category" },
    ],
  },
  {
    heading: "Account",
    items: [
      { href: "/account", label: "My account" },
      { href: "/wishlist", label: "Wishlist" },
      { href: "/track-order", label: "Track order" },
      { href: "/support", label: "Support" },
    ],
  },
];

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-ink-950/40 backdrop-blur-sm transition-opacity duration-500 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-[60] flex w-full max-w-[420px] flex-col bg-white shadow-2xl transition-transform duration-500 lg:hidden",
          open ? "translate-x-0" : "translate-x-full",
        )}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-line-soft px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
            Menu
          </p>
          <button
            type="button"
            onClick={onClose}
            className="icon-btn"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="border-b border-line-soft p-5">
          <ProfileMenu mobile onAction={onClose} />
        </div>

        <nav className="flex-1 overflow-y-auto px-5 py-6">
          {SECTIONS.map((section, sIndex) => (
            <div key={sIndex} className={sIndex === 0 ? "" : "mt-8"}>
              {section.heading && (
                <p className="px-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
                  {section.heading}
                </p>
              )}
              <ul className="mt-3 space-y-1">
                {section.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="group flex items-center justify-between rounded-2xl px-3 py-3 transition hover:bg-mist"
                    >
                      <div>
                        <p className="text-[15px] font-semibold text-ink-950">
                          {item.label}
                        </p>
                        {item.description && (
                          <p className="text-[12px] text-ink-500">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <ChevronRight
                        size={18}
                        className="text-ink-400 transition group-hover:translate-x-1 group-hover:text-ink-950"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-line-soft p-5">
          <Link
            href="/shop"
            onClick={onClose}
            className="btn btn-primary btn-block"
          >
            Shop the collection
          </Link>
        </div>
      </aside>
    </>
  );
}
