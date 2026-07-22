import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";

// Artwork in a 512 viewBox. `scale` shrinks the glyph toward center for maskable safe-zone.
const art = (size, maskable) => {
  const s = maskable ? 0.74 : 1; // shrink glyph for maskable
  const off = ((1 - s) * 512) / 2;
  return `<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ff7a5c"/><stop offset="1" stop-color="#e83c26"/>
    </linearGradient></defs>
    <rect width="512" height="512" rx="${maskable ? 0 : 118}" fill="url(#bg)"/>
    <g transform="translate(${off},${off}) scale(${s})">
      <path d="M150 196 Q256 156 362 196 L362 214 Q256 178 150 214 Z" fill="#ffffff" opacity="0.9"/>
      <circle cx="196" cy="232" r="24" fill="#ffffff"/>
      <circle cx="316" cy="232" r="24" fill="#ffffff"/>
      <path d="M156 300 Q256 392 356 300" fill="none" stroke="#ffffff" stroke-width="42" stroke-linecap="round"/>
      <circle cx="188" cy="372" r="12" fill="#ffd166"/>
      <circle cx="256" cy="392" r="12" fill="#8be0c0"/>
      <circle cx="324" cy="372" r="12" fill="#8ab6ff"/>
    </g></svg>`;
};

const targets = [
  { path: "src/app/apple-icon.png", size: 180, maskable: false },
  { path: "public/icons/icon-192.png", size: 192, maskable: false },
  { path: "public/icons/icon-512.png", size: 512, maskable: false },
  { path: "public/icons/maskable-512.png", size: 512, maskable: true },
];

const b = await chromium.launch();
const page = await (await b.newContext({ deviceScaleFactor: 1 })).newPage();
for (const t of targets) {
  await page.setViewportSize({ width: t.size, height: t.size });
  await page.setContent(`<body style="margin:0;padding:0">${art(t.size, t.maskable)}</body>`);
  const buf = await page.locator("svg").screenshot({ omitBackground: false });
  writeFileSync(t.path, buf);
  console.log("wrote", t.path, t.size);
}
await b.close();
