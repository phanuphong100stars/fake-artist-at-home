import { chromium } from "@playwright/test";
const out = process.argv[2];
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const scribble = async () => {
  const cb = await page.locator("canvas").boundingBox();
  const cx = cb.x + cb.width/2, cy = cb.y + cb.height/2;
  await page.mouse.move(cx - 70, cy);
  await page.mouse.down();
  for (let a=0;a<=16;a++){const t=a/16;await page.mouse.move(cx-70+t*140, cy+Math.sin(t*6)*40);await page.waitForTimeout(10);}
  await page.mouse.up(); await page.waitForTimeout(200);
};
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.getByText("เริ่มเล่น").click(); await page.waitForTimeout(300);
await page.getByText("ถัดไป").click(); await page.waitForTimeout(300);
await page.getByText("สุ่มบทบาท").click(); await page.waitForTimeout(500);
for (let i=0;i<3;i++){
  await page.getByText(/ฉันคือ/).click(); await page.waitForTimeout(250);
  const cover = page.getByText(/แตะค้าง/);
  const box = await cover.boundingBox();
  await page.mouse.move(box.x+box.width/2, box.y+box.height/2);
  await page.mouse.down(); await page.waitForTimeout(300); await page.mouse.up();
  await page.waitForTimeout(250);
  await page.getByText(/ส่งต่อ|เริ่มวาด/).click(); await page.waitForTimeout(350);
}
// draw turns
await scribble(); await page.getByText("เสร็จ ส่งต่อ").click(); await page.waitForTimeout(300);
await scribble(); await page.getByText("เสร็จ ส่งต่อ").click(); await page.waitForTimeout(300);
await scribble(); await page.getByText("จบเกม").click(); await page.waitForTimeout(400);
await page.screenshot({ path: `${out}/confirm.png` });
await page.getByText("เฉลยเลย").click();
await page.waitForTimeout(1300);
await page.screenshot({ path: `${out}/reveal.png` });
await page.getByText("จิตรกร", { exact: false }).first().click();
await page.waitForTimeout(700);
await page.screenshot({ path: `${out}/celebrate.png` });
await page.getByText("สถิติ").click(); await page.waitForTimeout(500);
await page.screenshot({ path: `${out}/stats.png` });
const o = await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth);
console.log("stats overflow:", o?"YES":"no");
await b.close();
