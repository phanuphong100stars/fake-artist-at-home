import { chromium } from "@playwright/test";
const out = process.argv[2] ?? ".";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

// impasto buttons rendered + swirling Van Gogh sky present
const impasto = await page.locator(".impasto").count();
const sky = await page.locator(".vg-sky").count();
console.log("impasto buttons on home:", impasto, impasto > 0 ? "OK" : "FAIL");
console.log("vg-sky present:", sky === 1 ? "OK" : "FAIL");
await page.screenshot({ path: `${out}/home.png`, fullPage: true });

// light theme (Sunflowers) via toggle
await page.evaluate(() => document.documentElement.setAttribute("data-theme", "light"));
await page.waitForTimeout(200);
await page.screenshot({ path: `${out}/home-light.png`, fullPage: true });
await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));

// F19 exit button appears off-home, returns home from a menu phase (no confirm)
await page.getByText("เริ่มเล่น").click();
await page.waitForTimeout(400);
const exit = page.getByRole("button", { name: "ออกจากเกม" });
console.log("exit button on setup:", (await exit.isVisible()) ? "OK" : "FAIL");
await page.screenshot({ path: `${out}/setup.png`, fullPage: true });
await exit.click();
await page.waitForTimeout(400);
console.log("exit -> home:", (await page.getByText("เริ่มเล่น").isVisible()) ? "OK" : "FAIL");

// high-contrast: sky hidden + impasto flattened (no box-shadow)
const hc = await page.evaluate(() => {
  document.documentElement.setAttribute("data-high-contrast", "");
  const skyEl = document.querySelector(".vg-sky");
  const btn = document.querySelector(".impasto");
  return {
    skyHidden: skyEl ? getComputedStyle(skyEl).display : "none",
    shadow: btn ? getComputedStyle(btn).boxShadow : "none",
  };
});
console.log("high-contrast sky hidden:", hc.skyHidden === "none" ? "OK" : `FAIL(${hc.skyHidden})`);
console.log("high-contrast impasto flat:", hc.shadow === "none" ? "OK" : `FAIL(${hc.shadow})`);
await page.screenshot({ path: `${out}/home-highcontrast.png`, fullPage: true });

await b.close();
