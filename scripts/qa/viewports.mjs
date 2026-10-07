// Realistic screenshots for the art-director review: the viewport as a visitor sees it (sticky header,
// mobile bar), scrolled down step by step. Usage:
//   node scripts/qa/viewports.mjs OUT_DIR 1440 900 / /la-carte/ /galerie/
import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";
const [, , OUT, W = "1440", H = "900", ...pages] = process.argv;
await mkdir(OUT, { recursive: true });
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const ctx = await b.newContext({ ignoreHTTPSErrors: true, viewport: { width: +W, height: +H }, timezoneId: "Europe/Paris", locale: "fr-FR" });
for (const p of pages) {
  const page = await ctx.newPage();
  await page.goto("https://localhost:4443" + p, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const slug = p === "/" ? "accueil" : p.replace(/\//g, "_").replace(/^_|_$/g, "");
  let i = 0;
  for (let y = 0; y < total && i < 9; y += Math.round(+H * 0.9), i++) {
    await page.mouse.wheel(0, i === 0 ? 0 : Math.round(+H * 0.9));
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT}/${slug}-${W}-${i}.png` });
  }
  await page.close();
}
await b.close();
