# Handoff — where the project stands (updated 2026-10-07, session 2, V2)

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
| 2 Direction | done — owner chose A « L'Enseigne » (`docs/design/directions.md`) |
| 3 Architecture | validated by the owner 2026-10-07 (`docs/design/phase3-architecture.md` v2) |
| 4 Build | **done** — 11 pages, static export, Netlify Forms, PDFs (`npm run pdf`, prebuild) |
| 5 QA | **done** — `docs/qa/phase5-report.md`: Lighthouse mobile ≥ 96 / 100 / 100 / 100 on 9 pages, axe 0, no overflow at 6 widths, 18/18 interaction checks |
| 6 Delivery | **delivered 2026-10-07** — `docs/RAPPORT-LIVRAISON.md`, `docs/DEPLOY.md`, `README.md`; waiting for the owner to connect Netlify + change DNS at Wix |

## V2 « Nocturne » (2026-10-07 evening) — owner found V1 « bas de gamme », wants WOW

- Owner feedback: bland, not original, photos poor; wants big high-quality images, dark cinematic
  mood, motion; sent 5 reference sites (dark food site with floating plates, Veloria Eve, Mori Table,
  Broso navy+gold, Visit Tokyo). Images in the session folder `images/2.webp`–`6.webp`.
- **Validated by the owner and rolled out to every page** (commit `d89fb5f`); `/apercu/` deleted and
  301-redirected to `/` in `netlify.toml`. The V1 token names in `globals.css` now carry night values
  (paper = night `#0b1020`, ink = cream `#f3ede2`, navy = panel `#141c36`) plus gold `#c9a86a`;
  Cormorant Garamond display (self-hosted variable woff2) + Spectral text + Montserrat caps labels.
- Layout: `Intro` (door, once per session) → `V2Header` (transparent → glass, full-screen `#v2-menu`
  dialog) → page → `FooterV2`, `StickyBar`, `Cursor`, `V2Motion` (one global GSAP + Lenis, effects
  rebuilt per pathname). Each inner page opens on `src/components/v2/PageHero.tsx`.
- **Rule:** a GSAP-pinned element must be an inner wrapper, never a node whose parent React manages
  (pinning the gallery `<section>` broke every client navigation; fixed in `739b39f`).
- Photos: `scripts/photos/v2/grade.py` « nocturne » grade (tone/colour only) → `assets/photos/v2/graded/`,
  fed to `npm run images` as ids `nuit-<id>`. Dish plates are cropped by the frame in every photo →
  no floating cut-outs possible without new photos (arch frames instead).
- Owner: « je ne veux rien payer » (no Everygen subscription → no AI generation) but « je valide les
  modèles d'IA libres » → a Real-ESRGAN restoration pass of `assets/photos/retouched/` was
  **started but stopped unfinished** when the owner ended the session (see « Stopped here » below)
  (`scripts/photos/v2/restore.py`); after it: `python3 scripts/photos/v2/grade.py`, `npm run images`,
  `npm run plates` + `npm run render:all` in `video/`.
- Remotion films in `video/` (`LogoReveal`, `LogoRevealVertical`, `Reel`); renders in `video/out/`
  (git-ignored) were sent to the owner on 2026-10-07.
- Lighthouse mobile on V2 measured 80–98 while the CPU was busy → re-measure on an idle machine;
  target ≥ 95 (levers: TBT of the global GSAP/Lenis, image weight).
- Owner's Netlify URL: `restaurant-comme-avant.netlify.app` (« je crois », unverified: netlify.app is
  blocked from the container). DNS of the domain still points to Wix.
- Push WIP that does not change the site with `[skip netlify]` in the commit message (saves credits).
- Keep agent fan-out small: the owner hit their usage limit twice with parallel workflows.

## Stopped here (2026-10-07, 21:30) — owner: « stop la session, on continue demain »

- Done today: V2 on every page (pushed), the 3 Remotion films rendered and sent to the owner, docs
  updated for V2 (`3291d68`).
- **Real-ESRGAN restoration: unfinished, nothing applied.** `assets/photos/retouched/` is unchanged;
  only `scripts/photos/v2/restore.py` (work in progress) is committed. Its venv, weights, cache and
  comparison sheets lived in the scratchpad and are lost. To redo: venv with torch CPU + the
  Real-ESRGAN weights from GitHub releases (allowed by the owner), compare denoise strengths
  0.25 / 0.5 / 0.8 against the current EDSR masters on `plat-poulpe`, `dessert-moelleux-chocolat`,
  `detail-niche-chartreuse`, `dessert-pomme-pochee`.
- **Catch from that run:** on `detail-niche-chartreuse` the model turns the crate lettering « CHAR »
  into garbled invented glyphs. Any restored photo must be checked region by region for text
  (crates, labels, the chocolate plaque, the sign) and keep the original pixels there; never ship
  invented details.
- Then: `python3 scripts/photos/v2/grade.py` → `npm run images` → build → Lighthouse on an idle CPU
  (target ≥ 95 mobile on every page) → `npm run plates` + `npm run render:all` in `video/` if the
  photos clearly improved → commit and push.
- Still waiting on the owner: exact Netlify URL (`restaurant-comme-avant.netlify.app`?), DNS change
  at Wix, the items in `docs/RAPPORT-LIVRAISON.md` §3, their reaction to the 3 films.

## Next actions, in order

1. When the owner has connected Netlify (`docs/DEPLOY.md`): check the live site (both domains, HTTPS,
   old Wix URLs redirect), make a real test booking, run Lighthouse against production.
2. Fill in what the owner sends (list in `docs/RAPPORT-LIVRAISON.md` §3): mediator, capital, host
   phone, validated allergens, review authors/dates, last orders, congés, group details, GPS point
   (then set `MAP_POINT` in `src/app/nous-trouver/page.tsx` and add `geo` to the JSON-LD).
3. After any change: `npm run typecheck && npm run lint && npm test && npm run build`, then the QA
   scripts (README « Contrôles qualité »).

## Owner decisions so far

- **Superseded visually by V2 « Nocturne »** (night, gold, Cormorant; validated 2026-10-07 evening).
  Kept from A: content, structure, the logo, Spectral text, the door motif. Original A spec:
  Direction **A « L'Enseigne »**: navy `#17213B`, white, pierre dorée `#A78547`, logo disc `#3D435B`;
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
| `scripts/images/`, `scripts/fonts/`, `scripts/pdf/`, `scripts/qa/` | image variants + OG, font subsets, carte/vins PDFs, QA (serve-h2, run-qa, lighthouse, interactions, viewports) |
| `docs/RAPPORT-LIVRAISON.md`, `docs/DEPLOY.md`, `docs/qa/phase5-report.md` | delivery report, go-live guide, QA results |
| `docs/design/boards/` | sources of the 10 canvas artboards + `blob-map.json` |
| `assets/photos/retouched/` + `README.md` | 16 retouched masters (EDSR ×2) + rights inventory |
| `assets/brand/` | logo SVGs (badge + wordmark) |
| `scripts/photos/retouch.py` + `manifest.json` | reproducible retouch pipeline |
| `scripts/brand/build_logo.py` | logo rebuild from Montserrat outlines |
| `src/components/v2/` | V2 « Nocturne »: sections, header, PageHero, motion, intro, cursor, `v2.css` |
| `scripts/photos/v2/` | nocturne grade (`grade.py`) and restoration (`restore.py`) |
| `video/` | Remotion brand films (`npm run plates`, `npm run render:all`) |
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
  `CHROME_PATH` set and `--chrome-flags="--headless=new --no-sandbox --ignore-certificate-errors"`;
  `@axe-core/playwright`. Measure on `scripts/qa/serve-h2.mjs` (HTTP/2 + Brotli): `npx serve` (HTTP/1.1)
  under-scores performance by 5–15 points. Background servers die after their time limit: restart them.
- api.netlify.com, api.vercel.com, nominatim.openstreetmap.org are blocked from the container.

## Working method to keep (rigour)

- Ultracode: use the Workflow tool for substantive steps; adversarial multi-lens review before
  presenting anything; verify facts against sources; never invent content.
- Commit and push every meaningful step to `claude/install-frontend-design-remotion-vvrxf5`.
- Talk to the owner in French, concise, plain; never present unverified claims as done.
