"use client";

import { useCallback, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import ProductVisual from "./productvisual";
import { cn } from "../lib/utils";

type ProductGalleryProps = {
  category: string;
  model: string;
  title: string;
  highlights: string[];
  productId?: number;
  imageUrls?: string[];
};

const VIEW_LABELS = ["Front view", "Features", "Specs", "In the box"];

export default function ProductGallery({
  category,
  model,
  title,
  highlights,
  productId,
  imageUrls = [],
}: ProductGalleryProps) {
  const slides = VIEW_LABELS.map((label, i) => ({
    label,
    caption: highlights[i] ?? highlights[0] ?? title,
    variant: i,
    imageUrl: imageUrls[i] || undefined,
  }));

  const [active, setActive] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const goTo = useCallback(
    (index: number) => setActive((index + slides.length) % slides.length),
    [slides.length],
  );

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(active + (diff > 0 ? 1 : -1));
    setTouchStart(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 lg:gap-4">
        {/* Thumbnails — boAt style */}
        <div className="hidden flex-col gap-2 sm:flex">
          {slides.map((slide, index) => (
            <button
              key={slide.label}
              type="button"
              onClick={() => setActive(index)}
              className={cn(
                "relative h-16 w-16 overflow-hidden rounded-xl border-2 transition lg:h-[72px] lg:w-[72px]",
                index === active
                  ? "border-ink-950"
                  : "border-line opacity-70 hover:opacity-100",
              )}
              aria-label={slide.label}
            >
              <ProductVisual
                category={category}
                model={model}
                size="sm"
                productId={productId}
                imageUrls={slide.imageUrl ? [slide.imageUrl] : []}
                className={cn(
                  index === active ? "" : "brightness-90",
                  slide.variant === 1 && "hue-rotate-15",
                  slide.variant === 2 && "hue-rotate-30",
                  slide.variant === 3 && "saturate-50",
                )}
              />
            </button>
          ))}
        </div>

        {/* Main swipe area */}
        <div
          className="relative min-w-0 flex-1 overflow-hidden rounded-2xl border border-line-soft bg-[#f4f4f5] shadow-sm"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="aspect-square w-full">
            {slides.map((slide, index) => (
              <div
                key={slide.label}
                className={cn(
                  "absolute inset-0 transition-opacity duration-500",
                  index === active ? "opacity-100" : "pointer-events-none opacity-0",
                )}
              >
                <ProductVisual
                  category={category}
                  model={model}
                  title={index === 0 ? title : undefined}
                  size="lg"
                  hover
                  productId={productId}
                  imageUrls={slide.imageUrl ? [slide.imageUrl] : []}
                  className={cn(
                    slide.variant === 1 && "hue-rotate-15",
                    slide.variant === 2 && "hue-rotate-30",
                    slide.variant === 3 && "saturate-50",
                  )}
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => goTo(active - 1)}
            className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-ink-900 shadow-md hover:bg-white"
            aria-label="Previous image"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => goTo(active + 1)}
            className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-ink-900 shadow-md hover:bg-white"
            aria-label="Next image"
          >
            <ChevronRight size={20} />
          </button>

          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Slide ${index + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  index === active ? "w-6 bg-white" : "w-1.5 bg-white/50",
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <p className="text-center text-sm font-semibold text-ink-600 sm:text-left">
        {slides[active].label} · {slides[active].caption}
      </p>

      {/* Mobile thumbnails */}
      <div className="flex gap-2 sm:hidden">
        {slides.map((slide, index) => (
          <button
            key={slide.label}
            type="button"
            onClick={() => setActive(index)}
            className={cn(
              "h-14 flex-1 overflow-hidden rounded-lg border-2",
              index === active ? "border-ink-950" : "border-line",
            )}
          >
            <ProductVisual
              category={category}
              model={model}
              size="sm"
              productId={productId}
              imageUrls={slide.imageUrl ? [slide.imageUrl] : []}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
