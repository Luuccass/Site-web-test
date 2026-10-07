# Handoff — where the project stands (updated 2026-10-07, session 2)

Read this first when the owner says « continue ». Then read `docs/design/phase3-architecture.md`.

## The brief (owner's prompt, summarised)

Award-level showcase site for **Restaurant Comme Avant** (3 place de l'Église, 69570 Dardilly,
04 78 66 19 57). Phases: 0 capabilities audit → 1 questions → 2 art direction (**wait for choice**) →
3 architecture & UX (**wait for validation**) → 4 build → 5 QA (screenshots 360/390/768/1024/1440/1920,
Lighthouse ≥ 95 mobile ×4, axe) → 6 delivery report. Non-negotiables: use all skills/tools; stop and
report any missing capability with 2–3 solutions; no fake content (placeholders `[À CONFIRMER]`,
listed in the final report); anti-generic design; code/files/comments in English, site in French.
Stack asked: Next.js App Router + TS + Tailwind, Motion, GSAP + ScrollTrigger, Lenis, next/font,
one icon family, content in editable files (menu.json, hours.json, site.config.ts…).

## Status

| Phase | State |
|---|---|
| 0 Audit | done (see chat; key limits below) |
| 1 Questions | done; answers in `docs/content/owner-input-2026-10-06.md` |
| 2 Direction | **done — owner chose A « L'Enseigne »** (`docs/design/directions.md`, boards on the canvas) |
| 3 Architecture | **validated by the owner 2026-10-07** (`docs/design/phase3-architecture.md` v2) |
| 4 Build | **in progress**: foundation + home page + motions M1/M2m/M3 done (commit `1bdf1d7`, preview videos sent); remaining pages built by workflow `build-pages` (carte, vins + PDF, restaurant + galerie, nous-trouver, réserver, légal, 404) |
| 5 QA | scripts ready: `scripts/qa/run-qa.mjs` (screenshots ×6 widths, axe, acceptance) and `scripts/qa/lighthouse.mjs` |
| 6 Delivery | not started (README, Netlify setup, DNS at Wix, final report) |

## Next actions, in order

1. Finish the remaining pages (check `src/app/*` against the sitemap in phase3 §2); apply the
   "shared changes" the page agents reported (npm `pdf` script, CSS, layout); `npm run typecheck`,
   `npm test`, `npx next build`; commit + push.
2. Phase 5: `npx serve out -l 4173` then `node scripts/qa/run-qa.mjs http://localhost:4173 <scratch>/qa`
   and `node scripts/qa/lighthouse.mjs http://localhost:4173 <scratch>/qa`; art-director critique of
   every screenshot; fix; re-run until axe = 0 and Lighthouse ≥ 95 ×4 on every page.
3. Phase 6: README (local launch, editing `content/*` on GitHub, monthly ardoise, scripts, deploy),
   Netlify setup guide, DNS change at Wix (keep OVH MX/SPF), final report with placeholders.

## Owner decisions so far

- Direction **A « L'Enseigne »**: navy `#17213B`, white, pierre dorée `#A78547`, logo disc `#3D435B`;
  Spectral everywhere (self-hosted full files to keep smcp/c2sc/tnum), Montserrat Medium only for the
  wordmark (SVG) and the address plaque; hero = « l'affiche de la porte » (navy sign panel + live white
  notice); no arch masks, no tile frieze, no gold, no terracotta UI.
- The owner wants motion design that is creative but disciplined (answered with the M1–M8 plan).
- Photos: the 15 retained photos are the owner's (confirmed). `detail-chartreuse-etagere` stays out
  (customer upload). Remove the staff member in `salle-allee-carreaux` by retouching.
- No original logo file → `assets/brand/logo-comme-avant*.svg` (reconstruction) is the logo.
- Lunch formulas 21 € / 25 € (Tue–Fri) confirmed. Booking = phone + form with manual confirmation.
  Parking on site. French only.
- 2026-10-07 answers: free hosting wanted, owner wants it handled → **Netlify free** (Vercel Hobby
  forbids commercial use) static export + Netlify Forms. Bookings to contact@restaurant-comme-avant.com,
  phone 04 78 66 19 57; bookable up to 30 days ahead, same day accepted until 1 h before if there is
  room (form flags same-day requests and recommends calling). Ardoise changes **monthly**, the site
  manager (owner) updates `content/ardoise.json`. Other open questions: « fais sans ». Allergens:
  owner trusts us → per-dish allergens stay unpublished until the kitchen validates
  `docs/content/allergens-draft.md`; legend + mandatory sentence shown.
- Deploy blocker: the container cannot reach api.netlify.com; the owner must connect the GitHub repo
  in Netlify once and change DNS at Wix (records in `docs/content/owner-input-2026-10-06.md`).
- Still unknown (listed in the final report): mediator, share capital, review authors/dates, last
  orders, holiday policy, congés dates, team bio/history.

## Where things are

| Path | What |
|---|---|
| `docs/content/owner-input-2026-10-06.md` | carte, wines, 6 Google reviews (verbatim), answers, decisions |
| `docs/research/restaurant-facts.md` | web research with confidence levels (homonym in Crépy-en-Valois!) |
| `docs/research/benchmark.md` | restaurant website benchmark (snippet-based) |
| `docs/research/photo-triage.md` | per-photo crops, alt texts, identity colours, rejects, shoot gaps |
| `docs/research/phase2-critique.md` | critique synthesis behind directions v2 |
| `docs/design/directions.md` | art direction spec v2 (A chosen) |
| `docs/design/phase3-architecture.md` | Phase 3 (validated) |
| `docs/dev/BUILD-BRIEF.md` | binding brief for page-building agents |
| `content/*` | site content: menu, wines, hours, reviews, gallery, ardoise, `site.config.ts` |
| `src/` | Next.js 16 app (static export), see `src/lib/status.ts` for the live open/closed logic |
| `scripts/images/`, `scripts/fonts/`, `scripts/qa/` | image variants + OG, font subsets, QA |
| `docs/design/boards/` | sources of the 10 canvas artboards + `blob-map.json` |
| `assets/photos/retouched/` + `README.md` | 16 retouched masters (EDSR ×2) + rights inventory |
| `assets/brand/` | logo SVGs (badge + wordmark) |
| `scripts/photos/retouch.py` + `manifest.json` | reproducible retouch pipeline |
| `scripts/brand/build_logo.py` | logo rebuild from Montserrat outlines |
| `.claude/skills/` | frontend-design, Remotion (12), Context Engineering (18) |
| `.claude/workflows/phase3-review.js` | saved review workflow |

Canvas with the three directions (private, owner only):
https://claude.ai/artifact/2TKe6e249NpaExp4YWW1w4

## Environment notes (cloud container — scratch files are lost between sessions)

- WebFetch and direct HTTP to most sites are **blocked** (restaurant site, Google, TheFork, OSM tiles).
  WebSearch works (≈ 200 searches per turn shared by all agents). npm, PyPI, Google Fonts
  (`fonts.googleapis.com` / `fonts.gstatic.com`), `raw.githubusercontent.com` and git clones work.
- Owner photos: Google Drive folder « Site web test/assets/photos » (folder id
  `1bZpuRBUVfkkDfmShC9JtYK-Y2F5-o-Jk`). `download_file_content` spills large files to
  `tool-results/*.txt` (JSON with base64 `content`) → decode with Python.
- Retouch tooling to recreate if needed: `python3 -m venv` + `opencv-contrib-python-headless numpy pillow fonttools brotli`;
  EDSR models from `https://raw.githubusercontent.com/Saafke/EDSR_Tensorflow/master/models/EDSR_x2.pb`
  (~5 min per image on 4 CPUs; geometry stage is cached).
- UI UX Pro Max skill ships without its data: clone `https://github.com/nextlevelbuilder/ui-ux-pro-max-skill`
  and run `src/ui-ux-pro-max/scripts/search.py`.
- QA: Playwright with `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`; `npx lighthouse@13` with
  `CHROME_PATH` set and `--chrome-flags="--headless=new --no-sandbox"`; `@axe-core/playwright`.

## Working method to keep (rigour)

- Ultracode: use the Workflow tool for substantive steps; adversarial multi-lens review before
  presenting anything; verify facts against sources; never invent content.
- Commit and push every meaningful step to `claude/install-frontend-design-remotion-vvrxf5`.
- Talk to the owner in French, concise, plain; never present unverified claims as done.
