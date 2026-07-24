import { chromium } from "@playwright/test";
const out = process.argv[2];
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.getByText("เริ่มเล่น").click(); await page.waitForTimeout(400);
await page.getByText("ถัดไป").click(); await page.waitForTimeout(400);

// confirm rounds stepper + voting toggle visible on gameSetting
console.log("rounds row:", await page.getByText("จำนวนรอบวาด").isVisible());
console.log("voting row:", await page.getByText("โหวตในแอป").isVisible());
await page.screenshot({ path: `${out}/gamesetting.png`, fullPage: true });

await page.getByText("สุ่มบทบาท").click(); await page.waitForTimeout(600);

// role reveal x3
for (let i = 0; i < 3; i++) {
  await page.getByText(/ฉันคือ/).click().catch(() => {});
  await page.waitForTimeout(300);
  const cover = page.getByText(/แตะค้าง/);
  const box = await cover.boundingBox();
  await page.mouse.move(box.x + box.width/2, box.y + box.height/2);
  await page.mouse.down(); await page.waitForTimeout(350); await page.mouse.up();
  await page.waitForTimeout(300);
  await page.getByText(/ส่งต่อ|เริ่มวาด/).click();
  await page.waitForTimeout(400);
}

// draw: 3 players x 2 rounds = 6 turns
for (let t = 0; t < 6; t++) {
  const canvas = page.locator("canvas").first();
  const cb = await canvas.boundingBox();
  const cx = cb.x + cb.width/2, cy = cb.y + cb.height/2;
  await page.mouse.move(cx - 60, cy);
  await page.mouse.down();
  for (let a = 0; a <= 12; a++) { await page.mouse.move(cx - 60 + a*10, cy + Math.sin(a)*30); await page.waitForTimeout(8); }
  await page.mouse.up();
  await page.waitForTimeout(200);
  if (t === 0) { const r = await page.getByText(/รอบ 1\/2/).isVisible().catch(() => false); console.log("round indicator:", r); }
  // advance turn (last turn opens a confirm dialog)
  await page.getByRole("button", { name: /ส่งต่อ|เฉลย|ไปโหวต/ }).first().click();
  await page.waitForTimeout(300);
  // dialog confirm shares the "ไปโหวต" label with the draw button -> scope to the dialog
  const dialog = page.getByRole("alertdialog");
  if (await dialog.isVisible().catch(() => false)) {
    await dialog.getByRole("button").first().click();
    await page.waitForTimeout(400);
  }
}

await page.waitForTimeout(500);
console.log("vote screen:", await page.getByText("ใครคือตัวปลอม?").isVisible().catch(() => false));
await page.screenshot({ path: `${out}/vote.png` });

// group picks one suspect, then reveal
await page.locator("button", { hasText: /ผู้เล่น/ }).first().click();
await page.waitForTimeout(200);
await page.getByRole("button", { name: /เฉลย/ }).click();
await page.waitForTimeout(400);

await page.waitForTimeout(1400);
console.log("reveal accused:", await page.getByText("กลุ่มโหวตให้").isVisible().catch(() => false));
await page.screenshot({ path: `${out}/reveal.png`, fullPage: true });
await b.close();
