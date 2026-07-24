import { chromium } from "@playwright/test";
const out = process.argv[2] ?? ".";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

// F18.1 painted buttons rendered + F18.2 paper texture on body
const paintLayers = await page.locator(".paint-fill").count();
const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundImage);
console.log("paint-fill layers on home:", paintLayers, paintLayers > 0 ? "OK" : "FAIL");
console.log("paper texture:", /svg/.test(bodyBg) ? "OK" : "FAIL");
await page.screenshot({ path: `${out}/home.png`, fullPage: true });

// F19 exit button appears off-home, returns home from a menu phase (no confirm)
await page.getByText("เริ่มเล่น").click();
await page.waitForTimeout(400);
const exit = page.getByRole("button", { name: "ออกจากเกม" });
console.log("exit button on setup:", (await exit.isVisible()) ? "OK" : "FAIL");
await page.screenshot({ path: `${out}/setup.png`, fullPage: true });
await exit.click();
await page.waitForTimeout(400);
console.log("exit -> home:", (await page.getByText("เริ่มเล่น").isVisible()) ? "OK" : "FAIL");

// F18.5 high-contrast flattens paint (filter none) + drops paper texture
const hc = await page.evaluate(() => {
  document.documentElement.setAttribute("data-high-contrast", "");
  const fill = document.querySelector(".paint-fill");
  return {
    filter: fill ? getComputedStyle(fill).filter : "none",
    body: getComputedStyle(document.body).backgroundImage,
  };
});
console.log("high-contrast paint filter none:", hc.filter === "none" ? "OK" : `FAIL(${hc.filter})`);
console.log("high-contrast paper off:", hc.body === "none" ? "OK" : `FAIL(${hc.body})`);
await page.screenshot({ path: `${out}/home-highcontrast.png`, fullPage: true });

await b.close();
