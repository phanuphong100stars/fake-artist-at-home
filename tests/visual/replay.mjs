import { chromium } from "@playwright/test";
const out = process.argv[2];
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const scribble = async (dx) => {
  const cb = await page.locator("canvas").boundingBox();
  const cx=cb.x+cb.width/2+dx, cy=cb.y+cb.height/2;
  await page.mouse.move(cx-60,cy); await page.mouse.down();
  for(let a=0;a<=16;a++){const t=a/16;await page.mouse.move(cx-60+t*120,cy+Math.sin(t*6)*45);await page.waitForTimeout(9);}
  await page.mouse.up(); await page.waitForTimeout(150);
};
await page.goto("http://localhost:3000",{waitUntil:"networkidle"});
await page.getByText("เริ่มเล่น").click(); await page.waitForTimeout(250);
await page.getByText("ถัดไป").click(); await page.waitForTimeout(250);
await page.getByText("สุ่มบทบาท").click(); await page.waitForTimeout(400);
for(let i=0;i<3;i++){const c=page.getByText(/แตะค้าง/);const bx=await c.boundingBox();await page.mouse.move(bx.x+bx.width/2,bx.y+bx.height/2);await page.mouse.down();await page.waitForTimeout(250);await page.mouse.up();await page.waitForTimeout(180);await page.getByText(/ส่งต่อ|เริ่มวาด/).click();await page.waitForTimeout(280);}
await scribble(-40); await page.getByText("เสร็จ ส่งต่อ").click(); await page.waitForTimeout(250);
await scribble(0); await page.getByText("เสร็จ ส่งต่อ").click(); await page.waitForTimeout(250);
await scribble(40); await page.getByText("จบเกม").click(); await page.waitForTimeout(300);
await page.getByText("เฉลยเลย").click(); await page.waitForTimeout(1400);
await page.getByText("จิตรกร",{exact:false}).first().click(); await page.waitForTimeout(500);
await page.getByText("ดูรีเพลย์").click(); await page.waitForTimeout(700);
await page.screenshot({ path: `${out}/replay.png` });
const o=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth);
console.log("replay overflow:", o?"YES":"no");
await b.close();
