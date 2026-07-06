"use client";

import Link from "next/link";
import { ArrowRight, Share2 } from "lucide-react";

const SHOP = [
  { href: "/shop", label: "All products" },
  { href: "/collections", label: "Collections" },
  { href: "/shop#collection", label: "Collection 2026" },
  { href: "/search?q=fast+chargers", label: "Fast chargers" },
];

const SUPPORT = [
  { href: "/track-order", label: "Track order" },
  { href: "/support", label: "Help center" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/account", label: "My account" },
];

export default function Footer() {
  return (
    <footer className="border-t border-line-soft bg-ink-950 text-white">
      <div className="page-wrap py-12 sm:py-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-12 sm:gap-16">
          <div className="lg:col-span-5">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-white text-ink-950 sm:h-9 sm:w-9">
                <svg width="18" height="18" viewBox="0 0 360 72" fill="none" className="sm:w-5 sm:h-5">
                  <path d="M75.5861 25.2156H95.7835V15.5489H82.3082ZM65.5832 55.0151H74.802 95.6716V45.3481H74.802V40.227H93.4946V30.5609H74.802V25.6955L65.2314 38.5951V55.0151Z" fill="#1cb0c8"/>
                </svg>
              </span>
              <span className="text-[16px] font-semibold tracking-tight sm:text-[18px]">
                Nxteraa
              </span>
            </Link>
            <p className="mt-4 max-w-md text-[13px] leading-relaxed text-white/60 sm:mt-6 sm:text-[15px]">
              Premium mobile accessories engineered for India. Chargers, audio,
              power banks and cables with the build quality of a flagship.
            </p>
            <form className="mt-6 max-w-md sm:mt-8">
              <label
                htmlFor="footer-email"
                className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 sm:text-xs"
              >
                Get the collection
              </label>
              <div className="mt-2 flex items-center gap-2 rounded-full border border-white/15 bg-white/5 p-1.5 transition focus-within:border-white/40 sm:mt-3">
                <input
                  id="footer-email"
                  type="email"
                  placeholder="you@example.com"
                  className="flex-1 bg-transparent px-3 py-1.5 text-[13px] text-white placeholder:text-white/40 focus:outline-none sm:px-4 sm:py-2 sm:text-[14px]"
                />
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink-950 transition hover:scale-105 sm:h-9 sm:w-9"
                  aria-label="Subscribe"
                >
                  <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:col-span-7 lg:grid-cols-3 sm:gap-8">
            <FooterColumn title="Shop" links={SHOP} />
            <FooterColumn title="Support" links={SUPPORT} />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 sm:text-[11px]">
                Contact
              </p>
              <div className="mt-4 space-y-2.5 text-[13px] text-white/80 sm:mt-5 sm:space-y-3 sm:text-[14px]">
                <a
                  href="https://wa.me/919996536222"
                  className="block transition hover:text-white"
                >
                  WhatsApp - +91 99965 36222
                </a>
                <a
                  href="mailto:hello@nxteraa.com"
                  className="block transition hover:text-white"
                >
                  hello@nxteraa.com
                </a>
                <p className="text-white/60">Mon-Sat - 10am - 7pm IST</p>
              </div>
              <div className="mt-5 flex items-center gap-2 sm:mt-6">
                <a
                  href="https://instagram.com"
                  aria-label="Instagram"
                  className="icon-btn-ghost"
                >
                  <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </a>
                <a
                  href="https://twitter.com"
                  aria-label="Twitter"
                  className="icon-btn-ghost"
                >
                  <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </a>
                <a
                  href="https://youtube.com"
                  aria-label="YouTube"
                  className="icon-btn-ghost"
                >
                  <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-[11px] text-white/40 sm:mt-16 sm:gap-4 sm:pt-8 sm:text-[12px] sm:flex-row sm:items-center">
          <p>&copy; {new Date().getFullYear()} Nxteraa. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-6 sm:gap-y-2">
            <Link href="/support" className="transition hover:text-white">
              Privacy
            </Link>
            <Link href="/support" className="transition hover:text-white">
              Terms
            </Link>
            <Link href="/support" className="transition hover:text-white">
              Cookies
            </Link>
            <span className="hidden sm:inline">Made in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
        {title}
      </p>
      <ul className="mt-5 space-y-3 text-[14px] text-white/80">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="transition hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
