import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/cart", "/checkout", "/account", "/api"],
      },
    ],
    sitemap: "https://nxtraa.online/sitemap.xml",
  };
}
