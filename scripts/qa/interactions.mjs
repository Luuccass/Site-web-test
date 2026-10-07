// Phase 5: interaction checks in a real browser (booking flow, same-day rule, lightbox, mobile menu,
// client-side navigation). Usage: node scripts/qa/interactions.mjs https://localhost:4443
import { chromium } from "playwright-core";

const [, , BASE = "https://localhost:4443"] = process.argv;
const CHROME = process.env.CHROME_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath: CHROME });
const results = [];
const check = (name, ok, extra = {}) => {
  results.push({ name, ok: !!ok, ...extra });
  console.log(`${ok ? "OK  " : "FAIL"} ${name}${Object.keys(extra).length ? " " + JSON.stringify(extra) : ""}`);
};

async function newPage({ width = 390, height = 844, at } = {}) {
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width, height }, timezoneId: "Europe/Paris", locale: "fr-FR" });
  const page = await ctx.newPage();
  if (at) await page.clock.install({ time: new Date(at) });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return { ctx, page, errors };
}

// 1. Booking request, Thursday 8 October 2026 at 10:00 Paris: dinner for 4 on the next open date.
{
  const { ctx, page, errors } = await newPage({ at: "2026-10-08T08:00:00Z" });
  let posted = null;
  await page.route("**/", (route) => {
    if (route.request().method() === "POST") {
      posted = route.request().postData();
      return route.fulfill({ status: 200, body: "ok" });
    }
    return route.continue();
  });
  await page.goto(BASE + "/reserver/", { waitUntil: "networkidle" });
  const date = page.locator("#reservation-date");
  check("date field becomes a select of open days", (await date.evaluate((el) => el.tagName)) === "SELECT");
  const options = await date.locator("option").evaluateAll((os) => os.map((o) => ({ v: o.value, t: o.textContent })));
  check("no closed day offered (Sunday, Monday)", !options.some((o) => /dimanche|lundi/i.test(o.t)), { first: options.slice(0, 3).map((o) => o.t) });
  // Submitting empty shows the error summary with focus.
  await page.locator('form[name="reservation"] [type="submit"]').click();
  const focusedRole = await page.evaluate(() => document.activeElement?.textContent?.slice(0, 60));
  check("empty submit focuses the error summary", /^Vérifiez votre demande/.test(focusedRole ?? ""), { focused: focusedRole });
  const friday = options.find((o) => /vendredi/i.test(o.t));
  await date.selectOption(friday.v);
  await page.locator("#reservation-service-soir").check();
  const slots = await page.locator("#reservation-heure option").evaluateAll((os) => os.map((o) => o.value).filter(Boolean));
  check("evening slots inside the service", slots[0] === "19:30" && slots.at(-1) <= "21:30", { first: slots[0], last: slots.at(-1) });
  await page.locator("#reservation-heure").selectOption("20:00");
  await page.locator("#reservation-couverts").fill("4");
  await page.locator("#reservation-nom").fill("Test QA");
  await page.locator("#reservation-telephone").fill("06 12 34 56 78");
  await page.locator('form[name="reservation"] [type="submit"]').click();
  await page.waitForTimeout(800);
  const body = new URLSearchParams(posted ?? "");
  check("posts the Netlify form fields", body.get("form-name") === "reservation" && body.get("date") && body.get("service") === "soir" && body.get("heure") === "20:00", {
    subject: body.get("subject"),
    jourMeme: body.get("jour-meme"),
  });
  const sent = await page.evaluate(() => ({ text: document.body.innerText.includes("pas encore confirmée"), focused: document.activeElement?.tagName }));
  check("success panel says the request is not yet confirmed and takes focus", sent.text && /^H\d$/.test(sent.focused ?? ""), sent);
  check("no console errors on /reserver/", errors.length === 0, { errors });
  await ctx.close();
}

// 2. Same-day rule, Thursday 8 October 2026 at 18:45 Paris: 19:30 is 45 min away → blocked, call.
{
  const { ctx, page } = await newPage({ at: "2026-10-08T16:45:00Z" });
  await page.goto(BASE + "/reserver/", { waitUntil: "networkidle" });
  const date = page.locator("#reservation-date");
  const today = await date.locator("option").evaluateAll((os) => os.map((o) => ({ v: o.value, t: o.textContent })).find((o) => /aujourd/i.test(o.t) || /jeudi 8/i.test(o.t)));
  check("today is offered while the evening service is still ahead", !!today, { today: today?.t });
  if (today) {
    await date.selectOption(today.v);
    await page.locator("#reservation-service-soir").check();
    let posted = false;
    await page.route("**/", (route) => (route.request().method() === "POST" ? ((posted = true), route.fulfill({ status: 200, body: "ok" })) : route.continue()));
    await page.locator("#reservation-heure").selectOption("19:30");
    await page.locator("#reservation-couverts").fill("2");
    await page.locator("#reservation-nom").fill("Test QA");
    await page.locator("#reservation-telephone").fill("06 12 34 56 78");
    await page.locator('form[name="reservation"] [type="submit"]').click();
    await page.waitForTimeout(600);
    const text = await page.evaluate(() => document.body.innerText);
    check("a slot less than 1 h away is refused and the phone is offered", !posted && /moins d.une heure/i.test(text), { posted });
    // 20:00 is 75 min away: allowed, flagged as same-day in the subject.
    await page.locator("#reservation-heure").selectOption("20:00");
    let body = null;
    await page.unroute("**/");
    await page.route("**/", (route) => (route.request().method() === "POST" ? ((body = new URLSearchParams(route.request().postData() ?? "")), route.fulfill({ status: 200, body: "ok" })) : route.continue()));
    await page.locator('form[name="reservation"] [type="submit"]').click();
    await page.waitForTimeout(600);
    check("same-day request 1 h ahead is sent and flagged", body?.get("jour-meme") === "oui" && /^AUJOURD/.test(body?.get("subject") ?? ""), { subject: body?.get("subject") });
  }
  await ctx.close();
}

// 3. Galerie lightbox: open, next, Escape, focus back on a thumbnail.
{
  const { ctx, page, errors } = await newPage({ width: 1440, height: 900 });
  await page.goto(BASE + "/galerie/", { waitUntil: "networkidle" });
  const first = page.locator("[data-lightbox-index]").first();
  await first.click();
  await page.waitForTimeout(500);
  const open = await page.evaluate(() => !!document.querySelector("dialog[open]"));
  check("lightbox opens", open);
  const label1 = await page.evaluate(() => document.querySelector("dialog[open]")?.innerText.match(/Photo \d+ sur \d+/)?.[0]);
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(400);
  const label2 = await page.evaluate(() => document.querySelector("dialog[open]")?.innerText.match(/Photo \d+ sur \d+/)?.[0]);
  check("arrow key goes to the next photo", label1 !== label2, { label1, label2 });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);
  const back = await page.evaluate(() => ({ closed: !document.querySelector("dialog[open]"), focus: document.activeElement?.getAttribute("data-lightbox-index") }));
  check("Escape closes and focus returns to a thumbnail", back.closed && back.focus !== null, back);
  check("no console errors on /galerie/", errors.length === 0, { errors });
  await ctx.close();
}

// 4. Mobile « Plus » sheet and client-side navigation (M6 transition must not break anything).
{
  const { ctx, page, errors } = await newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Plus" }).click();
  await page.waitForTimeout(400);
  check("Plus sheet opens as a modal dialog", await page.evaluate(() => document.querySelector("#plus-sheet")?.open));
  await page.locator("#plus-sheet").getByRole("link", { name: "Galerie" }).click();
  await page.waitForURL("**/galerie/");
  await page.waitForTimeout(800);
  const after = await page.evaluate(() => ({ sheetClosed: !document.querySelector("#plus-sheet")?.open, h1: document.querySelector("h1")?.textContent, focus: document.activeElement?.tagName }));
  check("navigating from the sheet closes it and lands on the new page", after.sheetClosed && after.h1 === "Galerie", after);
  await page.goBack();
  await page.waitForURL(BASE + "/");
  await page.waitForTimeout(800);
  check("back to home after client navigation", (await page.evaluate(() => document.querySelector("h1")?.textContent))?.includes("Comme Avant"));
  check("no console errors while navigating", errors.length === 0, { errors });
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(failed.length ? `${failed.length} FAILED` : `All ${results.length} interaction checks passed`);
process.exitCode = failed.length ? 1 : 0;
