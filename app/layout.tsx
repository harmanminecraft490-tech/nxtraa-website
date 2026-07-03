import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import Providers from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nxteraa - Premium Mobile Accessories",
  description:
    "Chargers, audio, power banks and cables engineered for India. Free express delivery, 1-year warranty, 7-day replacement.",
  metadataBase: new URL("https://nxteraa.com"),
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "Nxteraa - Premium Mobile Accessories",
    description:
      "Chargers, audio, power banks and cables engineered for India.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen bg-white font-sans text-ink-900">
        <Providers>
          <div className="flex min-h-screen w-full flex-col">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
