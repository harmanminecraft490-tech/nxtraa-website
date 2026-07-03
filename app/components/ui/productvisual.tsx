"use client";

import { useState } from "react";

import {
  Battery,
  Cable,
  Car,
  Headphones,
  Plug,
  Shield,
  Smartphone,
  Speaker,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { cn } from "../lib/utils";

const CATEGORY_META: Record<
  string,
  { icon: LucideIcon; gradient: string; label: string }
> = {
  Neckbands: {
    icon: Headphones,
    gradient: "from-slate-800 to-slate-950",
    label: "Neckband",
  },
  Earbuds: {
    icon: Smartphone,
    gradient: "from-cyan-700 to-slate-900",
    label: "Earbuds",
  },
  Chargers: {
    icon: Zap,
    gradient: "from-amber-500 to-orange-700",
    label: "Charger",
  },
  Cables: {
    icon: Cable,
    gradient: "from-blue-600 to-indigo-900",
    label: "Cable",
  },
  "Power Banks": {
    icon: Battery,
    gradient: "from-emerald-600 to-teal-900",
    label: "Power Bank",
  },
  Speakers: {
    icon: Speaker,
    gradient: "from-violet-600 to-purple-900",
    label: "Speaker",
  },
  "Car Holders": {
    icon: Car,
    gradient: "from-gray-700 to-gray-900",
    label: "Car Holder",
  },
  Adapters: {
    icon: Plug,
    gradient: "from-rose-600 to-red-900",
    label: "Adapter",
  },
  "Screen Guards": {
    icon: Shield,
    gradient: "from-sky-500 to-blue-800",
    label: "Screen Guard",
  },
  Accessories: {
    icon: Plug,
    gradient: "from-accent to-slate-900",
    label: "Accessory",
  },
};

type ProductVisualProps = {
  category: string;
  model: string;
  title?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  hover?: boolean;
  imageUrls?: string[];
  productId?: number;
};

const sizeMap = {
  sm: { box: "p-4", icon: 36, model: "text-[10px]", title: "text-xs" },
  md: { box: "p-6", icon: 48, model: "text-xs", title: "text-sm" },
  lg: { box: "p-10", icon: 64, model: "text-sm", title: "text-base" },
};

export default function ProductVisual({
  category,
  model,
  title,
  size = "md",
  className,
  hover = false,
  imageUrls = [],
  productId: _productId,
}: ProductVisualProps) {
  const meta = CATEGORY_META[category] ?? CATEGORY_META.Accessories;
  const Icon = meta.icon;
  const s = sizeMap[size];
  const [imgError, setImgError] = useState(false);

  // Use first image from imageUrls array
  const imageUrl = imageUrls.length > 0 ? imageUrls[0] : undefined;

  // Show actual image if imageUrl is provided and image loaded successfully
  if (imageUrl && !imgError) {
    return (
      <img
        src={imageUrl}
        alt={title || model}
        onError={() => setImgError(true)}
        className={cn(
          "h-full w-full object-cover",
          hover && "transition-transform duration-[1600ms] ease-out hover:scale-[1.03]",
          className,
        )}
      />
    );
  }

  // Fallback to placeholder icon
  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br text-white",
        meta.gradient,
        s.box,
        hover && "transition-transform duration-[1600ms] ease-out hover:scale-[1.03]",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_55%)]" />
      <Icon size={s.icon} strokeWidth={1.5} className="relative opacity-95" />
      <p className={cn("relative mt-4 font-bold uppercase tracking-[0.2em] opacity-80", s.model)}>
        {meta.label}
      </p>
      <p className={cn("relative mt-3 font-extrabold tracking-tight", s.model)}>
        {model}
      </p>
      {title && size === "lg" && (
        <p className={cn("relative mt-4 max-w-[85%] text-center font-medium leading-snug opacity-90", s.title)}>
          {title}
        </p>
      )}
    </div>
  );
}
