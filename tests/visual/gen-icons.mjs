import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";

const glyph = (scale, tx) => `
  <g transform="translate(${tx},${tx}) scale(${scale})" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
    <circle cx="13.5" cy="6.5" r=".9" fill="#fff" stroke="none"/>
    <circle cx="17.5" cy="10.5" r=".9" fill="#fff" stroke="none"/>
    <circle cx="8.5" cy="7.5" r=".9" fill="#fff" stroke="none"/>
    <circle cx="6.5" cy="12.5" r=".9" fill="#fff" stroke="none"/>
  </g>`;

// normal: rounded square, glyph ~300/512. maskable: full bleed, glyph ~240/512 (safe zone)
const svg = (size, maskable) => {
  const s = maskable ? 10 : 12.5;
  const tx = (24 * s) / 2; // half glyph
  const center = (512 - 24 * s) / 2;
  return `<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="512" rx="${maskable ? 0 : 114}" fill="#f0553d"/>
    <g transform="translate(${center},${center}) scale(${s})" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
      <circle cx="13.5" cy="6.5" r=".9" fill="#fff" stroke="none"/>
      <circle cx="17.5" cy="10.5" r=".9" fill="#fff" stroke="none"/>
      <circle cx="8.5" cy="7.5" r=".9" fill="#fff" stroke="none"/>
      <circle cx="6.5" cy="12.5" r=".9" fill="#fff" stroke="none"/>
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
  await page.setContent(`<body style="margin:0;padding:0">${svg(t.size, t.maskable)}</body>`);
  const buf = await page.locator("svg").screenshot({ omitBackground: false });
  writeFileSync(t.path, buf);
  console.log("wrote", t.path, t.size);
}
await b.close();
