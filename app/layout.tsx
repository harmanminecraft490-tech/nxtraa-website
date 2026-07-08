import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next"
import { Inter } from "next/font/google";

import "./globals.css";
import { AuthProvider } from "./authcontext";
import { CartProvider } from "./components/lib/cartcontext";
import MobileTabBar from "./components/layout/mobiletabbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Nxteraa | Premium Mobile Accessories",
    template: "%s | Nxteraa",
  },
  description: "Nxteraa offers premium mobile accessories including neckbands, earbuds, chargers, data cables, speakers, power banks and more.",
  metadataBase: new URL("https://nxtraa.online"),
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "Nxteraa | Premium Mobile Accessories",
    description: "Nxteraa offers premium mobile accessories including neckbands, earbuds, chargers, data cables, speakers, power banks and more.",
    url: "https://nxtraa.online",
    siteName: "Nxteraa",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "Nxteraa Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nxteraa | Premium Mobile Accessories",
    description: "Nxteraa offers premium mobile accessories including neckbands, earbuds, chargers, data cables, speakers, power banks and more.",
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

// App-like mobile behaviour: `viewportFit: "cover"` lets the page paint into the
// notch / home-indicator area so the `env(safe-area-inset-*)` insets used by the
// bottom tab bar resolve to real values instead of 0. The theme color tints the
// browser/PWA chrome to match the dark announcement bar.
// App-like mobile behaviour:
// - `viewportFit: "cover"` lets the page paint into the notch / home-indicator
//   area so the `env(safe-area-inset-*)` insets used by the bottom tab bar
//   resolve to real values instead of 0.
// - `maximumScale: 5` keeps pinch-to-zoom for accessibility while `initialScale: 1`
//   prevents iOS Safari from auto-zooming form inputs with <16px text.
// - `interactiveWidget: "resizes-content"` makes the on-screen keyboard shrink
//   the layout viewport instead of overlaying it, so inputs stay visible.
// - The theme color tints the browser/PWA chrome to match the dark
//   announcement bar.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#050506",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {  
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Nxteraa",
    "url": "https://nxtraa.online",
    "logo": "https://nxtraa.online/logo.svg",
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Nxteraa",
    "url": "https://nxtraa.online",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://nxtraa.online/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen min-h-dvh bg-white font-sans text-ink-900">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <AuthProvider>
          <CartProvider>
            {/* pb-[64px] on mobile keeps content clear of the bottom tab bar.
                min-h-dvh (dynamic viewport height) tracks the actually-visible
                area on mobile Safari — 100vh includes the retracting address
                bar and would overflow, breaking the "fits the phone" feel. */}
            <div className="flex min-h-screen min-h-dvh w-full flex-col pb-[calc(64px+env(safe-area-inset-bottom))] lg:pb-0">
              {children}
            </div>
            <MobileTabBar />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
