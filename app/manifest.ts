import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Collapsar — Merge to the Void",
    short_name: "Collapsar",
    description: "Drop, merge, and collapse celestial bodies into a singularity.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#05040a",
    theme_color: "#05040a",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
