import { chromium } from "@playwright/test";
const out = process.argv[2];
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto("http://localhost:3000",{waitUntil:"networkidle"});
await page.getByLabel("ตั้งค่า").click(); await page.waitForTimeout(400);
await page.getByText("คำของฉัน").click(); await page.waitForTimeout(500);
// add a cluster
const inputs = page.getByPlaceholder(/คำที่/);
await inputs.nth(0).fill("รถเมล์");
await inputs.nth(1).fill("รถตู้");
await inputs.nth(2).fill("รถสองแถว");
await page.getByRole("button",{name:/เพิ่มชุดคำ$/}).click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${out}/custom.png` });
const o=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth);
console.log("custom overflow:", o?"YES":"no");
await b.close();
