import Link from "next/link";
import { Headphones } from "lucide-react";

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
  products,
} from "./components/lib/products";

export default function HomePage() {
  const bestsellers = getBestsellers(4);
  const mustTry = getMustTry(4);
  const fastChargers = getFastChargers(4);

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
              <h2 className="section-title mt-4 text-ink-950">Shop by need</h2>
              <p className="body-copy mt-4">
                Browse all 136 products by category.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
              {categories
                .filter((category) => category !== "All")
                .slice(0, 8)
                .map((category) => (
                  <Link
                    key={category}
                    href={`/search?q=${encodeURIComponent(category)}`}
                    className="group flex flex-col items-center rounded-2xl border border-line bg-white px-5 py-8 text-center transition hover:border-accent hover:shadow-lg sm:items-start sm:px-7 sm:py-9 sm:text-left"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent transition group-hover:bg-accent group-hover:text-white">
                      <Headphones size={26} />
                    </div>
                    <h3 className="mt-5 text-lg font-extrabold text-ink-950">{category}</h3>
                    <p className="mt-2 text-sm font-medium text-ink-500">
                      {products.filter((p) => p.category === category).length} products
                    </p>
                  </Link>
                ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
