import Link from "next/link";
import { Heart } from "lucide-react";

import AnnouncementBar from "../components/layout/announcementbar";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/footer";

export default function WishlistPage() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="min-h-[70vh] bg-canvas">
        <div className="mx-auto flex w-full max-w-[1500px] flex-col items-center px-5 py-16 text-center sm:px-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-50 text-red-400">
            <Heart size={40} />
          </div>
          <h1 className="mt-8 text-3xl font-black text-ink-950">Your wishlist is empty</h1>
          <p className="mt-4 max-w-md text-ink-500">
            Save products you love and come back to them anytime.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex h-12 items-center rounded-full bg-accent px-8 font-black text-white hover:bg-accent-deep"
          >
            Browse products
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
