import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { AuthProvider } from "./authcontext";
import { CartProvider } from "./components/lib/cartcontext";

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
    icon: "/NE-NXTERAA-logo.ico",
  },
  openGraph: {
    title: "Nxteraa | Premium Mobile Accessories",
    description: "Nxteraa offers premium mobile accessories including neckbands, earbuds, chargers, data cables, speakers, power banks and more.",
    url: "https://nxtraa.online",
    siteName: "Nxteraa",
    images: [
      {
        url: "https://nxtraa.online/og-image.png", // Assuming you will add an OG image
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nxteraa | Premium Mobile Accessories",
    description: "Nxteraa offers premium mobile accessories including neckbands, earbuds, chargers, data cables, speakers, power banks and more.",
    // creator: "@yourtwitterhandle", // Add your Twitter handle
    images: ["https://nxtraa.online/og-image.png"], // Assuming you will add an OG image
  },
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
    "logo": "https://nxtraa.online/NE-NXTERAA-logo.png", // Assuming you have a logo at this URL
    "sameAs": [
      // Add your social media profile URLs here
      // "https://www.facebook.com/your-profile",
      // "https://www.instagram.com/your-profile"
    ]
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
      <body className="min-h-screen bg-white font-sans text-ink-900">
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
            <div className="flex min-h-screen w-full flex-col">{children}</div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
