import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "จิตรกรตัวปลอม — Fake Artist",
    short_name: "จิตรกรตัวปลอม",
    description: "เกมปาร์ตี้วาดรูปหาตัวปลอม เล่นด้วยมือถือเครื่องเดียว",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fbfbf7",
    theme_color: "#f0553d",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
