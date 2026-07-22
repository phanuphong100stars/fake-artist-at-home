import { chromium } from "@playwright/test";
const out = process.argv[2];
const b = await chromium.launch();
const page = await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2})).newPage();
await page.goto("http://localhost:3000",{waitUntil:"networkidle"});
await page.waitForTimeout(900);
console.log("title:", await page.title());
await page.screenshot({ path: `${out}/home2.png` });
await b.close();
