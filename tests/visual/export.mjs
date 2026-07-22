import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";
const out = process.argv[2];
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
const page = await ctx.newPage();
const scribble = async (dx) => {
  const cb = await page.locator("canvas").boundingBox();
  const cx=cb.x+cb.width/2+dx, cy=cb.y+cb.height/2;
  await page.mouse.move(cx-60,cy); await page.mouse.down();
  for(let a=0;a<=14;a++){const t=a/14;await page.mouse.move(cx-60+t*120,cy+Math.sin(t*6)*40);await page.waitForTimeout(8);}
  await page.mouse.up(); await page.waitForTimeout(120);
};
await page.goto("http://localhost:3000",{waitUntil:"networkidle"});
await page.getByText("เริ่มเล่น").click(); await page.waitForTimeout(200);
await page.getByText("ถัดไป").click(); await page.waitForTimeout(200);
await page.getByText("สุ่มบทบาท").click(); await page.waitForTimeout(350);
for(let i=0;i<3;i++){const c=page.getByText(/แตะค้าง/);const bx=await c.boundingBox();await page.mouse.move(bx.x+bx.width/2,bx.y+bx.height/2);await page.mouse.down();await page.waitForTimeout(220);await page.mouse.up();await page.waitForTimeout(150);await page.getByText(/ส่งต่อ|เริ่มวาด/).click();await page.waitForTimeout(250);}
await scribble(-40); await page.getByText("เสร็จ ส่งต่อ").click(); await page.waitForTimeout(200);
await scribble(0); await page.getByText("เสร็จ ส่งต่อ").click(); await page.waitForTimeout(200);
await scribble(40); await page.getByText("จบเกม").click(); await page.waitForTimeout(250);
await page.getByText("เฉลยเลย").click(); await page.waitForTimeout(1300);
await page.getByText("จิตรกร",{exact:false}).first().click(); await page.waitForTimeout(400);
await page.getByText("ดูรีเพลย์").click(); await page.waitForTimeout(500);

// GIF
const dlGif = page.waitForEvent("download", { timeout: 30000 });
await page.getByText(/บันทึก GIF|GIF /).click();
const g = await dlGif;
const gpath = `${out}/export.gif`; await g.saveAs(gpath);
const gb = readFileSync(gpath);
console.log("GIF magic:", gb.slice(0,6).toString("ascii"), "bytes:", gb.length);

// Video
const dlVid = page.waitForEvent("download", { timeout: 40000 });
await page.getByText(/บันทึกวิดีโอ|วิดีโอ /).click();
const v = await dlVid;
const vpath = `${out}/export.webm`; await v.saveAs(vpath);
const vb = readFileSync(vpath);
console.log("WEBM bytes:", vb.length, "header:", vb.slice(0,4).toString("hex"));
await b.close();
