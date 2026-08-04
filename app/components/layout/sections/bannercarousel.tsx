"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { SiteBanner } from "../../lib/banners";

interface BannerCarouselProps {
  banners?: SiteBanner[];
}

export default function BannerCarousel({ banners = [] }: BannerCarouselProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Use DB banners only — no hardcoded fallback
  const activeBanners = banners;
  const count = activeBanners.length;

  if (count === 0) return null;

  const goTo = useCallback(
    (index: number) => setActive((index + count) % count),
    [count],
  );

  useEffect(() => {
    if (paused || count <= 1) return;
    const timer = setInterval(() => setActive((c) => (c + 1) % count), 4500);
    return () => clearInterval(timer);
  }, [paused, count]);

  // Touch swipe support for mobile phone UI
  const minSwipeDistance = 40;

  const handleTouchStart = (e: React.TouchEvent) => {
    setPaused(true);
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    setPaused(false);
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) {
      goTo(active + 1);
    } else if (distance < -minSwipeDistance) {
      goTo(active - 1);
    }
  };

  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden bg-white select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative w-full">
        {/* Hero banner — fills remaining viewport via calc(100svh - nav heights) */}
        <div className="hero-banner">
          {activeBanners.map((banner, index) => (
            <Link
              key={banner.src + index}
              href={banner.href}
              className={`absolute inset-0 block transition-opacity duration-700 ease-in-out ${
                index === active ? "z-10 opacity-100" : "z-0 opacity-0 pointer-events-none"
              }`}
              aria-hidden={index !== active}
              tabIndex={index === active ? 0 : -1}
            >
              <Image
                src={banner.src}
                alt={banner.alt}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover object-center"
              />
            </Link>
          ))}
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              className="absolute left-2.5 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 backdrop-blur-md text-white shadow-lg transition-all hover:bg-black/50 active:scale-95 sm:left-6 sm:h-11 sm:w-11 sm:bg-white/90 sm:text-gray-900 sm:hover:bg-white"
              aria-label="Previous banner"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              className="absolute right-2.5 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 backdrop-blur-md text-white shadow-lg transition-all hover:bg-black/50 active:scale-95 sm:right-6 sm:h-11 sm:w-11 sm:bg-white/90 sm:text-gray-900 sm:hover:bg-white"
              aria-label="Next banner"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 sm:bottom-4 sm:gap-2">
              {activeBanners.map((banner, index) => (
                <button
                  key={banner.src + index}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`Banner ${index + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 sm:h-2 ${
                    index === active
                      ? "w-6 bg-accent shadow-md sm:w-8"
                      : "w-1.5 bg-white/70 hover:bg-white sm:w-2"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
