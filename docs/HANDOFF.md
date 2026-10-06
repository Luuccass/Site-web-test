# Handoff — where the project stands (updated 2026-10-06, end of session 1)

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
| 3 Architecture | **draft written** (`docs/design/phase3-architecture.md`); adversarial review was started then stopped at the owner's request → **re-run it first** |
| 4–6 | not started |

## Next actions, in order

1. Re-run the Phase 3 review: `Workflow` with the saved script `.claude/workflows/phase3-review.js`
   (3 lenses: UX/conversion, motion+perf+a11y, SEO+French legal; then synthesis).
2. Apply the endorsed revisions to `docs/design/phase3-architecture.md`, commit, present Phase 3 to
   the owner in French (sitemap, 10-second journey, mobile wireframe, CTA hierarchy, motion plan M1–M8,
   open questions). **Wait for validation.**
3. Phase 4: scaffold Next.js 16; build content files first; prototype motions M1–M3 and share a
   preview link before building every page (promised to the owner).

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
- Still unanswered: hosting (Vercel Pro vs Netlify/Cloudflare free), e-mail receiving bookings,
  domain registrar, allergens per dish, group capacity, team bio/history (owner: « fais avec ce que tu as »).

## Where things are

| Path | What |
|---|---|
| `docs/content/owner-input-2026-10-06.md` | carte, wines, 6 Google reviews (verbatim), answers, decisions |
| `docs/research/restaurant-facts.md` | web research with confidence levels (homonym in Crépy-en-Valois!) |
| `docs/research/benchmark.md` | restaurant website benchmark (snippet-based) |
| `docs/research/photo-triage.md` | per-photo crops, alt texts, identity colours, rejects, shoot gaps |
| `docs/research/phase2-critique.md` | critique synthesis behind directions v2 |
| `docs/design/directions.md` | art direction spec v2 (A chosen) |
| `docs/design/phase3-architecture.md` | Phase 3 draft |
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
