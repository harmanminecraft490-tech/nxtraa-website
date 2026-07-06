import type { MetadataRoute } from "next";
import { getAllProductsCached } from "./components/lib/products-cache";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://nxtraa.online";
  const products = await getAllProductsCached();

  // Product pages live at /buy?product=<id> (there is no /product/[id] route).
  const productUrls: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/buy?product=${product.id}`,
    lastModified: new Date(),
  }));

  const staticUrls: MetadataRoute.Sitemap = [
    "",
    "/shop",
    "/collections",
    "/search",
    "/support",
    "/track-order",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
  }));

  return [...staticUrls, ...productUrls];
}
