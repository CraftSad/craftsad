import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "3D Бирка — сад начинается с имени",
    short_name: "3D Бирка",
    description: "Садовые бирки для рассады и грядок.",
    lang: "ru",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "browser",
    background_color: "#f5f1e8",
    theme_color: "#f5f1e8",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
