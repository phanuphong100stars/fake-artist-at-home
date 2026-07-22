import { chromium } from "@playwright/test";
const out = process.argv[2];
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const chk = async (n) => {
  const o = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  console.log(`${n}: overflow ${o ? "YES ⚠️" : "no"}`);
};
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.getByText("เริ่มเล่น").click();
await page.waitForTimeout(500);
await page.getByText("ถัดไป").click();          // setup -> gameSetting
await page.waitForTimeout(600);
await chk("gameSetting"); await page.screenshot({ path: `${out}/gamesetting.png` });
await page.getByText("สุ่มบทบาท").click();        // -> roleReveal
await page.waitForTimeout(700);
await chk("roleReveal-pass"); await page.screenshot({ path: `${out}/role-pass.png` });
// hold to peek
const btn = page.getByText("แตะค้างเพื่อดูบทบาท");
const box = await btn.boundingBox();
await page.mouse.move(box.x + box.width/2, box.y + box.height/2);
await page.mouse.down();
await page.waitForTimeout(500);
await page.screenshot({ path: `${out}/role-peek.png` });
await page.mouse.up();
await b.close();
