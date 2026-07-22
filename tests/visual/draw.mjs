import { chromium } from "@playwright/test";
const out = process.argv[2];
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.getByText("เริ่มเล่น").click(); await page.waitForTimeout(400);
await page.getByText("ถัดไป").click(); await page.waitForTimeout(400);
await page.getByText("สุ่มบทบาท").click(); await page.waitForTimeout(600);

// role reveal x3
for (let i = 0; i < 3; i++) {
  const cover = page.getByText(/แตะค้าง/);
  const box = await cover.boundingBox();
  await page.mouse.move(box.x + box.width/2, box.y + box.height/2);
  await page.mouse.down(); await page.waitForTimeout(350); await page.mouse.up();
  await page.waitForTimeout(300);
  await page.getByText(/ส่งต่อ|เริ่มวาด/).click();
  await page.waitForTimeout(400);
}
const o = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
console.log("draw overflow:", o ? "YES" : "no");

// scribble on canvas
const canvas = page.locator("canvas");
const cb = await canvas.boundingBox();
const cx = cb.x + cb.width/2, cy = cb.y + cb.height/2;
await page.mouse.move(cx - 80, cy - 40);
await page.mouse.down();
for (let a = 0; a <= 20; a++) {
  const t = a / 20;
  await page.mouse.move(cx - 80 + t*160, cy - 40 + Math.sin(t*Math.PI*2)*50);
  await page.waitForTimeout(12);
}
await page.mouse.up();
await page.waitForTimeout(300);
await page.screenshot({ path: `${out}/draw.png` });
await b.close();
