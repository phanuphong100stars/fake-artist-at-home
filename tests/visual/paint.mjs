import { chromium } from "@playwright/test";
const out = process.argv[2] ?? ".";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const shot = (n) => page.screenshot({ path: `${out}/${n}.png`, fullPage: true });
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

const impasto = await page.locator(".impasto").count();
const sky = await page.locator(".vg-sky").count();
console.log("impasto buttons on home:", impasto, impasto > 0 ? "OK" : "FAIL");
console.log("vg-sky present:", sky === 1 ? "OK" : "FAIL");
await shot("home");

// light theme (Sunflowers)
await page.evaluate(() => document.documentElement.setAttribute("data-theme", "light"));
await page.waitForTimeout(200);
await shot("home-light");
await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));

// settings (panels + controls)
await page.getByRole("button", { name: "ตั้งค่า" }).click();
await page.waitForTimeout(400);
await shot("settings");
await page.getByRole("button", { name: "กลับ" }).click();
await page.waitForTimeout(300);

// game flow -> role reveal card
await page.getByText("เริ่มเล่น").click(); await page.waitForTimeout(350);
await page.getByText("ถัดไป").click(); await page.waitForTimeout(350);
console.log("exit button off-home:", (await page.getByRole("button", { name: "ออกจากเกม" }).isVisible()) ? "OK" : "FAIL");
await page.getByText("สุ่มบทบาท").click(); await page.waitForTimeout(600);
await shot("reveal-handoff");
await page.getByText(/ฉันคือ/).click(); await page.waitForTimeout(300);
const cover = page.getByText(/แตะค้าง/);
const box = await cover.boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down(); await page.waitForTimeout(400);
await shot("reveal-card");
await page.mouse.up();

// high-contrast: sky hidden + impasto flattened
const hc = await page.evaluate(() => {
  document.documentElement.setAttribute("data-high-contrast", "");
  const skyEl = document.querySelector(".vg-sky");
  const btn = document.querySelector(".impasto");
  return { skyHidden: skyEl ? getComputedStyle(skyEl).display : "none",
           shadow: btn ? getComputedStyle(btn).boxShadow : "none" };
});
console.log("high-contrast sky hidden:", hc.skyHidden === "none" ? "OK" : `FAIL(${hc.skyHidden})`);
console.log("high-contrast impasto flat:", hc.shadow === "none" ? "OK" : `FAIL(${hc.shadow})`);
await shot("home-highcontrast");

await b.close();
