"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const [isMobile, setIsMobile] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Natural dimensions of the active image: { w, h } once loaded
  const [imgNatural, setImgNatural] = useState<{ w: number; h: number } | null>(null);

  // Detect mobile viewport
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Track container width
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

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

  // Touch swipe support
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

  // Pick the right image for the current viewport
  const banner = activeBanners[active];
  const imageSrc =
    isMobile && banner.mobileImageUrl
      ? banner.mobileImageUrl
      : banner.desktopImageUrl || banner.src;

  const displayMode = banner.displayMode ?? "FIT";

  // Calculate container height from natural aspect ratio
  // FIT mode: height = width * (naturalH / naturalW) — full image visible
  // FILL mode: height = width * 0.45 (wide landscape, may crop) — capped at 80vh
  let containerHeight = 0;
  if (imgNatural && containerWidth > 0) {
    if (displayMode === "FIT") {
      containerHeight = containerWidth * (imgNatural.h / imgNatural.w);
    } else {
      // FILL: landscape ratio, capped at 80vh
      const maxH = typeof window !== "undefined" ? window.innerHeight * 0.8 : 600;
      containerHeight = Math.min(containerWidth * 0.45, maxH);
    }
  }

  // Handle image load — capture natural dimensions
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImgNatural({ w: img.naturalWidth, h: img.naturalHeight });
  };

  // Reset natural dimensions when active banner changes
  useEffect(() => {
    setImgNatural(null);
  }, [active, isMobile]);

  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden bg-white select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      ref={containerRef}
    >
      <div className="relative w-full">
        {/* Hero banner — height driven by image aspect ratio */}
        <div
          className={`hero-banner ${displayMode === "FIT" ? "hero-banner-fit" : "hero-banner-fill"}`}
          style={{
            height: containerHeight > 0 ? `${containerHeight}px` : undefined,
            minHeight: containerHeight > 0 ? undefined : "200px",
          }}
        >
          {activeBanners.map((b, index) => {
            const src =
              isMobile && b.mobileImageUrl
                ? b.mobileImageUrl
                : b.desktopImageUrl || b.src;

            const mode = b.displayMode ?? "FIT";

            return (
              <Link
                key={b.src + index}
                href={b.href}
                className={`block transition-opacity duration-700 ease-in-out ${
                  index === active
                    ? "z-10 opacity-100 relative"
                    : "z-0 opacity-0 pointer-events-none absolute inset-0"
                }`}
                aria-hidden={index !== active}
                tabIndex={index === active ? 0 : -1}
                style={index === active ? { width: "100%" } : undefined}
              >
                {mode === "FIT" ? (
                  <>
                    {/* FIT: blurred background expansion + sharp foreground image */}
                    <div className="absolute inset-0">
                      <Image
                        src={src}
                        alt=""
                        fill
                        className="object-cover blur-xl scale-110 opacity-40"
                        sizes="100vw"
                        aria-hidden
                      />
                    </div>
                    <div className="relative flex items-center justify-center w-full" style={{ height: containerHeight > 0 ? `${containerHeight}px` : "auto" }}>
                      <Image
                        src={src}
                        alt={b.alt}
                        width={imgNatural?.w ?? 1920}
                        height={imgNatural?.h ?? 720}
                        className="max-h-[80vh] w-auto h-auto object-contain"
                        sizes="100vw"
                        priority={index === 0}
                        onLoad={index === active ? handleImageLoad : undefined}
                      />
                    </div>
                  </>
                ) : (
                  /* FILL: object-cover, fills the container */
                  <Image
                    src={src}
                    alt={b.alt}
                    fill
                    className="object-cover object-center"
                    sizes="100vw"
                    priority={index === 0}
                    onLoad={index === active ? handleImageLoad : undefined}
                  />
                )}
              </Link>
            );
          })}
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
              {activeBanners.map((b, index) => (
                <button
                  key={b.src + index}
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
