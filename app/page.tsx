import Link from "next/link";
import AnnouncementBar from "./components/layout/announcementbar";
import Navbar from "./components/layout/navbar";
import Footer from "./components/layout/footer";
import FeaturedProducts from "./components/home/featured-products";

function Hero() {
  return (
    <section className="w-full bg-gray-100">
      <div className="mx-auto max-w-7xl px-5 py-16 text-center sm:px-8 md:py-24 lg:py-32">
        <h1 className="text-4xl font-extrabold tracking-tight text-ink-950 sm:text-5xl md:text-6xl">
          Engineered for India
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-600 md:text-xl">
          Premium mobile accessories with free express delivery, 1-year warranty, and 7-day replacement.
        </p>
        <div className="mt-8">
          <Link href="/shop" className="btn btn-primary btn-lg">
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main>
      <AnnouncementBar />
      <Navbar />
      <Hero />
      <FeaturedProducts />
      <Footer />
    </main>
  );
}