import Link from "next/link";
import { Headphones } from "lucide-react";

import AnnouncementBar from "../components/layout/announcementbar";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/footer";
import ProductCard from "../shop/productcard";
import { categories, products } from "../components/lib/products";

export default function CollectionsPage() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="min-h-screen bg-white">
        <section className="bg-canvas py-12">
          <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8 lg:px-10">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-accent">Collections</p>
            <h1 className="mt-2 text-4xl font-black text-ink-950 sm:text-5xl">Shop by category</h1>
            <p className="mt-3 max-w-2xl text-ink-500">
              Browse Nxteraa accessories grouped by what you need — audio, charging, power, and more.
            </p>
          </div>
        </section>

        {categories.filter((c) => c !== "All").map((category) => {
          const categoryProducts = products.filter((p) => p.category === category);
          if (categoryProducts.length === 0) return null;

          return (
            <section key={category} className="border-t border-line py-12">
              <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8 lg:px-10">
                <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                      <Headphones size={24} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-ink-950">{category}</h2>
                      <p className="text-ink-500">{categoryProducts.length} products</p>
                    </div>
                  </div>
                  <Link href="/shop" className="font-bold text-accent hover:underline">
                    View all
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-9 lg:grid-cols-4 lg:gap-10">
                  {categoryProducts.slice(0, 4).map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </main>
      <Footer />
    </>
  );
}
