import Link from "next/link";
import {
  AudioLines,
  BatteryCharging,
  Cable,
  Car,
  Headphones,
  Package,
  PlugZap,
  ShieldCheck,
  Speaker,
  Zap,
  type LucideIcon,
} from "lucide-react";

import AnnouncementBar from "./components/layout/announcementbar";
import Navbar from "./components/layout/navbar";
import Footer from "./components/layout/footer";
import BannerCarousel from "./components/layout/sections/bannercarousel";
import TrustStrip from "./components/layout/sections/truststrip";
import { ProductRow } from "./components/layout/sections/productrow";
import {
  categories,
  getBestsellers,
  getFastChargers,
  getMustTry,
} from "./components/lib/products";
import { getAllProductsCached } from "./components/lib/products-cache";

// Distinct icon per category so the "Shop by need" grid reads at a glance.
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Neckbands: AudioLines,
  Earbuds: Headphones,
  Chargers: Zap,
  Cables: Cable,
  "Power Banks": BatteryCharging,
  Speakers: Speaker,
  "Car Holders": Car,
  Adapters: PlugZap,
  "Screen Guards": ShieldCheck,
  Accessories: Package,
};

export const metadata = {
  title: "Nxteraa | Premium Mobile Accessories",
  description:
    "Nxteraa offers premium mobile accessories including neckbands, earbuds, chargers, data cables, speakers, power banks and more.",
  alternates: {
    canonical: "https://nxtraa.online/",
  },
  openGraph: {
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "Nxteraa Logo",
      },
    ],
  },
  twitter: {
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "Nxteraa Logo",
      },
    ],
  },
};

export default async function HomePage() {
  const bestsellers = await getBestsellers(4);
  const mustTry = await getMustTry(4);
  const fastChargers = await getFastChargers(4);
  const allProducts = await getAllProductsCached();

  return (
    <>
      <AnnouncementBar />
      <Navbar />

      <main className="w-full bg-white">
        <BannerCarousel />
        <TrustStrip />

        <ProductRow
          eyebrow="Top rated"
          title="Bestsellers"
          href="/shop#collection"
          items={bestsellers}
        />

        <ProductRow
          eyebrow="Editor's pick"
          title="Must try"
          href="/collections"
          items={mustTry}
        />

        <ProductRow
          eyebrow="Charge faster"
          title="Fast chargers"
          href={`/search?q=${encodeURIComponent("Fast Chargers")}`}
          items={fastChargers}
        />

        <section className="section-space bg-white">
          <div className="page-wrap">
            <div className="section-header max-w-2xl">
              <p className="eyebrow">Categories</p>
              <h2 className="section-title mt-3 text-ink-950">Shop by need</h2>
              <p className="body-copy mt-3">
                Browse all {allProducts.length} products by category.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
              {categories
                .filter((category) => category !== "All")
                .slice(0, 8)
                .map((category) => {
                  const Icon = CATEGORY_ICONS[category] ?? Package;
                  const count = allProducts.filter(
                    (p: { category: string }) => p.category === category,
                  ).length;
                  return (
                    <Link
                      key={category}
                      href={`/search?q=${encodeURIComponent(category)}`}
                      className="group flex flex-col items-center rounded-2xl border border-line bg-white px-4 py-6 text-center transition hover:border-accent hover:shadow-lg sm:items-start sm:px-7 sm:py-9 sm:text-left"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent transition group-hover:bg-accent group-hover:text-white sm:h-14 sm:w-14">
                        <Icon className="h-[22px] w-[22px] sm:h-[26px] sm:w-[26px]" strokeWidth={2} />
                      </div>
                      <h3 className="mt-4 text-base font-extrabold text-ink-950 sm:mt-5 sm:text-lg">
                        {category}
                      </h3>
                      <p className="mt-1.5 text-xs font-medium text-ink-500 sm:mt-2 sm:text-sm">
                        {count} {count === 1 ? "product" : "products"}
                      </p>
                    </Link>
                  );
                })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
