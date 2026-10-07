// Lighthouse (mobile preset) on every page; writes a summary table and fails if a score < 95.
// Measure against the HTTP/2 + Brotli server (production-like), not `npx serve`:
//   node scripts/qa/serve-h2.mjs 4443 out &
//   node scripts/qa/lighthouse.mjs https://localhost:4443 OUT_DIR
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";

const [, , BASE = "https://localhost:4443", OUT = "qa-output"] = process.argv;
const PAGES = ["/", "/la-carte/", "/la-carte/vins/", "/le-restaurant/", "/galerie/", "/nous-trouver/", "/reserver/", "/mentions-legales/", "/confidentialite/"];
const CHROME = process.env.CHROME_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
await mkdir(path.join(OUT, "lighthouse"), { recursive: true });

const rows = [];
for (const p of PAGES) {
  const file = path.join(OUT, "lighthouse", (p === "/" ? "accueil" : p.replace(/\//g, "_").replace(/^_|_$/g, "")) + ".json");
  execFileSync(
    "npx",
    ["-y", "lighthouse@13", BASE + p, "--quiet", "--only-categories=performance,accessibility,best-practices,seo", "--output=json", `--output-path=${file}`, "--chrome-flags=--headless=new --no-sandbox --ignore-certificate-errors"],
    { env: { ...process.env, CHROME_PATH: CHROME }, stdio: "ignore" },
  );
  const r = JSON.parse(await readFile(file, "utf8"));
  const c = r.categories;
  const a = r.audits;
  rows.push({
    page: p,
    performance: Math.round(c.performance.score * 100),
    accessibility: Math.round(c.accessibility.score * 100),
    bestPractices: Math.round(c["best-practices"].score * 100),
    seo: Math.round(c.seo.score * 100),
    lcp: a["largest-contentful-paint"].displayValue,
    cls: a["cumulative-layout-shift"].displayValue,
    tbt: a["total-blocking-time"].displayValue,
  });
  console.log(JSON.stringify(rows.at(-1)));
}
await writeFile(path.join(OUT, "lighthouse", "summary.json"), JSON.stringify(rows, null, 2));
const failing = rows.filter((r) => [r.performance, r.accessibility, r.bestPractices, r.seo].some((s) => s < 95));
console.log(failing.length ? `BELOW 95: ${failing.map((f) => f.page).join(", ")}` : "All pages ≥ 95 on the four categories");
