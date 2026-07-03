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
        <div className="relative aspect-[2.4/1] w-full min-h-[200px] sm:aspect-[2.6/1] sm:min-h-[280px] md:min-h-[340px] lg:aspect-[2.8/1] lg:min-h-[420px] xl:min-h-[480px]">
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
              className="absolute left-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-lg transition hover:bg-white sm:left-6 sm:h-11 sm:w-11"
              aria-label="Previous banner"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              className="absolute right-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-lg transition hover:bg-white sm:right-6 sm:h-11 sm:w-11"
              aria-label="Next banner"
            >
              <ChevronRight size={22} />
            </button>

            <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2 sm:bottom-5">
              {siteBanners.map((banner, index) => (
                <button
                  key={banner.src}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`Banner ${index + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === active
                      ? "w-7 bg-white shadow-md"
                      : "w-2 bg-white/50 hover:bg-white/80"
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
