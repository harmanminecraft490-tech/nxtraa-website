import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://nxtraa.online';

  // In the future, you can fetch dynamic routes (e.g., products, collections)
  // from a database or API here and add them to the sitemap.

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
    },
    // Add other static pages here
  ];
}