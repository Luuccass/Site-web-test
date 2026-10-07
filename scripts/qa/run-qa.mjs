// Phase 5 QA: screenshots at 6 widths, axe accessibility audit, acceptance checks.
// Usage: node scripts/qa/run-qa.mjs http://localhost:4173 OUT_DIR
// Needs a static server on the exported site (npx serve out -l 4173) and Chromium
// (CHROME_PATH or /opt/pw-browsers/chromium-1194/chrome-linux/chrome).
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright-core";

const [, , BASE = "http://localhost:4173", OUT = "qa-output"] = process.argv;
const CHROME = process.env.CHROME_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const PAGES = ["/", "/la-carte/", "/la-carte/vins/", "/le-restaurant/", "/galerie/", "/nous-trouver/", "/reserver/", "/mentions-legales/", "/confidentialite/", "/page-inexistante/"];
const WIDTHS = [
  [360, 640],
  [390, 844],
  [768, 1024],
  [1024, 768],
  [1440, 900],
  [1920, 1080],
];
const slug = (p) => (p === "/" ? "accueil" : p.replace(/\//g, "_").replace(/^_|_$/g, ""));

await mkdir(path.join(OUT, "shots"), { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME });
const report = { axe: {}, acceptance: [], thirdParty: {}, consoleErrors: {}, overflow: [] };

async function scrollThrough(page, h) {
  const H = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < H; y += Math.round(h * 0.8)) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(1400);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
}

for (const [w, h] of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, timezoneId: "Europe/Paris", locale: "fr-FR" });
  for (const p of PAGES) {
    const page = await ctx.newPage();
    const external = new Set();
    const errors = [];
    page.on("request", (r) => {
      const u = new URL(r.url());
      if (!["localhost", "127.0.0.1"].includes(u.hostname) && !u.protocol.startsWith("data")) external.add(u.hostname);
    });
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto(BASE + p, { waitUntil: "networkidle" });
    await scrollThrough(page, h);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 1) report.overflow.push({ page: p, width: w, overflow });
    await page.screenshot({ path: path.join(OUT, "shots", `${slug(p)}-${w}.png`), fullPage: true });
    if (w === 390) {
      report.thirdParty[p] = [...external];
      report.consoleErrors[p] = errors;
      const cookies = await ctx.cookies();
      if (cookies.length) report.acceptance.push({ check: "no cookies", page: p, ok: false, cookies });
      const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
      report.axe[p] = axe.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.slice(0, 5).map((n) => n.target.join(" ")) }));
    }
    await page.close();
  }
  await ctx.close();
}

// Acceptance: the hero CTA row is visible at load, or the sticky bar is (phase3 §7.1).
for (const [w, h, scale] of [
  [360, 640, 1],
  [375, 553, 1],
  [390, 844, 1],
  [412, 823, 1],
  [360, 640, 2],
]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, timezoneId: "Europe/Paris", locale: "fr-FR" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  if (scale !== 1) await page.addStyleTag({ content: `html{font-size:${scale * 100}%}` });
  await page.waitForTimeout(500);
  const r = await page.evaluate(() => {
    const cta = document.getElementById("hero-cta")?.getBoundingClientRect();
    const bar = document.querySelector(".sticky-bar");
    const barVisible = bar && getComputedStyle(bar).transform === "none";
    return { ctaBottom: cta?.bottom ?? null, vh: window.innerHeight, barVisible };
  });
  report.acceptance.push({ check: "hero CTA or sticky bar visible at load", viewport: `${w}x${h}`, textScale: scale, ok: (r.ctaBottom !== null && r.ctaBottom <= r.vh) || r.barVisible, ...r });
  await ctx.close();
}

// Reduced motion: doors open and walls lit without animation.
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  const r = await page.evaluate(() => ({
    doors: [...document.querySelectorAll(".door")].every((d) => d.classList.contains("is-open")),
    walls: [...document.querySelectorAll(".wall")].every((d) => d.classList.contains("is-lit")),
  }));
  report.acceptance.push({ check: "reduced motion: content visible without animation", ok: r.doors && r.walls, ...r });
  await ctx.close();
}

// No JavaScript: content and booking form present.
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(BASE + "/reserver/", { waitUntil: "load" });
  const r = await page.evaluate(() => ({
    form: !!document.querySelector('form[name="reservation"]'),
    submit: !!document.querySelector('form[name="reservation"] [type="submit"]'),
  }));
  report.acceptance.push({ check: "booking form works without JS (markup present)", ok: r.form && r.submit, ...r });
  await ctx.close();
}

await browser.close();
await writeFile(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));
const axeCount = Object.values(report.axe).reduce((n, v) => n + v.length, 0);
console.log(`axe violations: ${axeCount}`);
console.log(`overflow issues: ${report.overflow.length}`);
console.log(`acceptance: ${report.acceptance.filter((a) => a.ok).length}/${report.acceptance.length} ok`);
console.log(`third-party hosts: ${JSON.stringify(report.thirdParty)}`);
