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
