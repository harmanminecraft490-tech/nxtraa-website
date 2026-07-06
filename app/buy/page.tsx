import Link from "next/link";
import { CheckCircle2, Star, Truck } from "lucide-react";

import AnnouncementBar from "../components/layout/announcementbar";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/footer";
import ProductGallery from "../components/ui/productgallery";
import ProductReviews from "../components/ui/productreviews";
import { getAllProductsCached } from "../components/lib/products-cache";
import BuyActions from "./buyactions";

type BuyPageProps = {
  searchParams: Promise<{
    product?: string;
    action?: string;
  }>;
};

export default async function BuyPage({ searchParams }: BuyPageProps) {
  const params = await searchParams;
  const productId = Number(params.product ?? 1);
  const products = await getAllProductsCached();
  const product = products.find((p) => p.id === productId) ?? products[0];

  if (!product) {
    return (
      <>
        <AnnouncementBar />
        <Navbar />
        <main className="min-h-[60vh] bg-white">
          <div className="page-wrap flex flex-col items-center py-20 text-center">
            <h1 className="section-title text-ink-950">Product unavailable</h1>
            <p className="body-copy mt-4">
              We could not load this product right now. Please try again shortly.
            </p>
            <Link
              href="/shop"
              className="mt-8 rounded-full bg-accent px-8 py-3.5 text-sm font-bold text-white hover:bg-accent-deep"
            >
              Back to shop
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const discount = Math.round(
    ((product.oldPrice - product.price) / product.oldPrice) * 100,
  );
  const startInCart = params.action === "cart";

  return (
    <>
      <AnnouncementBar />
      <Navbar />

      <main className="min-h-screen bg-white">
        <div className="page-wrap section-space !pb-10">
          <nav className="mb-10 flex flex-wrap items-center gap-2 text-sm font-medium text-ink-500">
            <Link href="/shop" className="hover:text-accent">
              Shop
            </Link>
            <span>/</span>
            <Link href="/collections" className="hover:text-accent">
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-ink-950">{product.model}</span>
          </nav>

          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
            <div className="space-y-5">
              <ProductGallery
                category={product.category}
                model={product.model}
                title={product.title}
                highlights={product.highlights}
                productId={product.id}
                imageUrls={product.imageUrls}
              />
              <div className="flex items-center gap-3 rounded-xl bg-accent-soft px-5 py-4 text-sm font-medium text-accent-deep">
                <Truck size={18} className="shrink-0 text-accent" />
                Free delivery on orders Rs. 999+
              </div>
            </div>

            <div className="space-y-10">
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-700">
                    <Star size={14} fill="currentColor" />
                    {product.rating}
                  </span>
                  <span className="rounded-full bg-accent-soft px-3 py-1.5 text-sm font-bold text-accent-deep">
                    {discount}% OFF
                  </span>
                  <span className="rounded-full bg-ink-100 px-3 py-1.5 text-sm font-bold text-ink-700">
                    In stock
                  </span>
                  <span className="rounded-full bg-ink-950 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
                    {product.badge}
                  </span>
                </div>

                <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-ink-950 sm:text-4xl lg:leading-[1.15]">
                  {product.title}
                </h1>

                <p className="body-copy max-w-lg leading-relaxed">{product.description}</p>
              </div>

              <div className="flex flex-wrap items-baseline gap-5 border-b border-line pb-10">
                <span className="text-4xl font-extrabold tracking-tight text-ink-950 sm:text-5xl">
                  Rs. {product.price}
                </span>
                <span className="text-xl font-medium text-ink-400 line-through">
                  MRP Rs. {product.oldPrice}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  ["Color", product.color],
                  ["Warranty", "1 year"],
                  ["Delivery", "2–4 days"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-line bg-canvas px-4 py-5 text-center sm:text-left"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                      {label}
                    </p>
                    <p className="mt-2 text-sm font-bold text-ink-950">{value}</p>
                  </div>
                ))}
              </div>

              <ul className="space-y-4">
                {product.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-3">
                    <CheckCircle2
                      size={18}
                      className="mt-0.5 shrink-0 text-accent"
                    />
                    <span className="text-sm font-medium leading-relaxed text-ink-700">
                      {highlight}
                    </span>
                  </li>
                ))}
              </ul>

              <BuyActions
                productId={product.id}
                startInCart={startInCart}
              />
            </div>
          </div>

          <ProductReviews productId={product.id} catalogRating={product.rating} />
        </div>
      </main>

      <Footer />
    </>
  );
}
