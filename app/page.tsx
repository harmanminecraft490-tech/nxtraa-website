import type { Metadata } from "next";

import LandingPage from "./charger/_landing/LandingPage";

// The Aerobuds launch experience is now the site's front door — it funnels
// visitors into the official store via the Shop / Shop Now CTAs.
export const metadata: Metadata = {
  title: "Nxtraa Aerobuds NE AP-555 — True Wireless Stereo",
  description:
    "Meet the Nxtraa Aerobuds NE AP-555. True Wireless Stereo earbuds with 40 hours of playtime, 13mm deep-bass drivers, ENC calls, Bluetooth 5.3 and IPX5. MRP ₹1499. Shop now on nxtraa.online.",
  alternates: {
    canonical: "https://nxtraa.online/",
  },
  openGraph: {
    title: "Nxtraa Aerobuds NE AP-555 — True Wireless Stereo",
    description:
      "40 hours of music. Zero wires. Premium TWS earbuds with ENC, deep bass and IPX5 — engineered for the way you move.",
    url: "https://nxtraa.online/",
    type: "website",
  },
};

export default function HomePage() {
  return <LandingPage />;
}
