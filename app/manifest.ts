import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nxteraa",
    short_name: "Nxteraa",
    description: "Premium mobile accessories",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#27c4dd",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
