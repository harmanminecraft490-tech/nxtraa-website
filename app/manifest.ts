import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nxteraa",
    short_name: "Nxteraa",
    description: "Premium mobile accessories.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#27c4dd",
    icons: [
      {
        src: "/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
