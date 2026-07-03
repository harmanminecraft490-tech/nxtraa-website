import AnnouncementBar from "../components/layout/announcementbar";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/footer";

import ShopBanner from "./shopbanner";
import BestSellers from "./bestsellers";

export default function ShopPage() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />

      <main className="bg-white min-h-screen">
        <ShopBanner />
        <BestSellers />
      </main>

      <Footer />
    </>
  );
}