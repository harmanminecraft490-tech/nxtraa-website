"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const messages = [
  "Free shipping on orders Rs. 999+",
  "1 year warranty - Made for India",
  "7-day replacement - Easy returns",
  "Brand assured quality",
];

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % messages.length);
    }, 4000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className="relative isolate w-full overflow-hidden border-b border-line-soft bg-ink-950 text-white"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="page-wrap flex h-8 items-center justify-between text-[10px] font-medium uppercase tracking-[0.18em] sm:h-10 sm:text-xs">
        <Link
          href="/shop"
          className="hidden items-center gap-2 text-white/70 transition hover:text-white sm:flex"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
          New collection 2026
        </Link>

        <div className="relative flex flex-1 items-center justify-center overflow-hidden text-center sm:flex-none sm:justify-end sm:text-right">
          {messages.map((message, i) => (
            <span
              key={message}
              aria-hidden={i !== index}
              className={`absolute inset-x-0 flex items-center justify-center whitespace-nowrap px-2 transition-all duration-500 sm:inset-x-auto sm:right-0 sm:justify-end sm:px-0 ${
                i === index
                  ? "opacity-100 translate-y-0"
                  : "pointer-events-none opacity-0 translate-y-2"
              }`}
            >
              {message}
            </span>
          ))}
        </div>

        <div className="hidden items-center gap-4 text-white/70 sm:flex sm:gap-5">
          <Link href="/track-order" className="transition hover:text-white">
            Track order
          </Link>
          <Link href="/support" className="transition hover:text-white">
            Support
          </Link>
        </div>
      </div>
    </div>
  );
}
