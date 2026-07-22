// Quick visual capture — screenshots each view at mobile + desktop.
// Usage: node tests/visual/shots.mjs [outDir] [baseUrl]
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const outDir = process.argv[2] || "/tmp/shots";
const base = process.argv[3] || "http://localhost:3000";
mkdirSync(outDir, { recursive: true });

const viewports = [
  { name: "iphone", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
];

const browser = await chromium.launch();
for (const vp of viewports) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
    colorScheme: "light",
  });
  const page = await ctx.newPage();
  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200); // let entrance animations settle
  await page.screenshot({ path: `${outDir}/home-${vp.name}.png` });
  // basic overflow check
  const overflow = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
  }));
  console.log(`${vp.name}: horiz overflow = ${overflow.scrollW > overflow.clientW ? "YES ⚠️" : "no"}`);
  await ctx.close();
}
await browser.close();
console.log("saved to", outDir);
