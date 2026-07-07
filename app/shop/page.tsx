import type { Metadata } from "next";

import AnnouncementBar from "../components/layout/announcementbar";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/footer";

import ShopClient from "./shopclient";

export const metadata: Metadata = {
  title: "Shop All Products",
  description:
    "Browse the full Nxteraa catalog — neckbands, earbuds, chargers, cables, power banks, speakers and more. Filter by category and sort by price or rating.",
  alternates: { canonical: "https://nxtraa.online/shop" },
};

export default function ShopPage() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />

      <main className="bg-white min-h-screen">
        <ShopClient />
      </main>

      <Footer />
    </>
  );
}
