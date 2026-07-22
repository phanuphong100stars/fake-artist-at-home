import { chromium } from "@playwright/test";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3100", { waitUntil: "networkidle" });
// wait for SW to control
await page.waitForFunction(() => navigator.serviceWorker.controller !== null, { timeout: 8000 }).catch(()=>{});
const sw = await page.evaluate(() => !!navigator.serviceWorker.controller);
console.log("SW controlling:", sw);
// warm asset cache by interacting a bit
await page.getByText("เริ่มเล่น").click().catch(()=>{});
await page.waitForTimeout(800);
// go offline + reload
await ctx.setOffline(true);
await page.reload({ waitUntil: "domcontentloaded" }).catch((e)=>console.log("reload err", e.message));
await page.waitForTimeout(800);
const title = await page.title();
const hasHero = await page.getByText(/จิตรกรตัวปลอม|ผู้เล่น/).first().isVisible().catch(()=>false);
console.log("offline title:", title);
console.log("offline renders app:", hasHero);
await b.close();
