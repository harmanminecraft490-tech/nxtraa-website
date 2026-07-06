"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { siteBanners } from "../../lib/banners";



export default function BannerCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = siteBanners.length;

  const goTo = useCallback(
    (index: number) => setActive((index + count) % count),
    [count],
  );

  useEffect(() => {
    if (paused || count <= 1) return;
    const timer = setInterval(() => setActive((c) => (c + 1) % count), 4500);
    return () => clearInterval(timer);
  }, [paused, count]);

  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden bg-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative w-full">
        {/* Full-bleed banner — no black box, image fills edge to edge */}
        <div className="relative aspect-[2.4/1] w-full min-h-[160px] sm:aspect-[2.6/1] sm:min-h-[240px] md:min-h-[300px] lg:aspect-[2.8/1] lg:min-h-[380px] xl:min-h-[440px]">
          {siteBanners.map((banner, index) => (
            <Link
              key={banner.src}
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
              className="absolute left-3 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-lg transition hover:bg-white sm:left-6 sm:h-11 sm:w-11"
              aria-label="Previous banner"
            >
              <ChevronLeft className="h-[18px] w-[18px] sm:h-[22px] sm:w-[22px]" />
            </button>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              className="absolute right-3 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-lg transition hover:bg-white sm:right-6 sm:h-11 sm:w-11"
              aria-label="Next banner"
            >
              <ChevronRight className="h-[18px] w-[18px] sm:h-[22px] sm:w-[22px]" />
            </button>

            <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 sm:bottom-4 sm:gap-2">
              {siteBanners.map((banner, index) => (
                <button
                  key={banner.src}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`Banner ${index + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 sm:h-2 ${
                    index === active
                      ? "w-5 bg-white shadow-md sm:w-7"
                      : "w-1.5 bg-white/50 hover:bg-white/80 sm:w-2"
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
