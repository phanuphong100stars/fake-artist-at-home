import { chromium } from "@playwright/test";
const out = process.argv[2];
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto("http://localhost:3000",{waitUntil:"networkidle"});
await page.getByText("เริ่มเล่น").click(); await page.waitForTimeout(250);
await page.getByText("ถัดไป").click(); await page.waitForTimeout(250);
await page.getByText("สุ่มบทบาท").click(); await page.waitForTimeout(500);
// stage 1: handoff gate (should NOT show แตะค้าง)
const gate = await page.getByText(/แตะค้าง/).count();
await page.screenshot({ path: `${out}/pass-gate.png` });
console.log("peek surface visible on gate (should be 0):", gate);
// tap "ฉันคือ" to reveal peek surface
await page.getByText(/ฉันคือ/).click(); await page.waitForTimeout(500);
const peek = await page.getByText(/แตะค้าง/).count();
console.log("peek surface after acknowledge (should be 1):", peek);
await page.screenshot({ path: `${out}/pass-peek.png` });
await b.close();
