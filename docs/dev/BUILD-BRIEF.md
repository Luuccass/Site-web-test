# Build brief — Comme Avant website (for every agent touching the code)

Read first: `docs/design/phase3-architecture.md` (v2, validated), `docs/design/directions.md` (direction A
« L'Enseigne »), `AGENTS.md` (Next.js 16.4 differs from older versions: check
`node_modules/next/dist/docs/` before using an API). Content: `content/*.json`, `content/site.config.ts`.

## Stack and constraints
- Next.js 16.4 App Router, **static export** (`output: "export"`, `trailingSlash: true`): no server
  actions, no route handlers with request data, no `next/image` optimisation (use `<Photo>`), no
  next.config redirects/headers (they live in `netlify.toml`). Every page must prerender.
- Tailwind CSS 4 (tokens in `src/app/globals.css` `@theme`), TypeScript strict.
- Fonts: Spectral (300/400/400i/500) via `--font-serif` (default body font), Montserrat Medium caps only
  for the address plaque (`font-[family-name:var(--font-plaque)]`).
- Motion libraries: `motion` (only inside route-level client components, via `LazyMotion` +
  `domAnimation`), `gsap` + `ScrollTrigger` + `lenis` ONLY on /le-restaurant desktop, loaded with
  `import()` after mount when `(min-width:1024px) and (pointer:fine) and (prefers-reduced-motion: no-preference)`.
  Never import them from shared/layout components.

## Design tokens (Tailwind classes)
Colours: `bg-navy`, `bg-navy-raised`, `bg-paper` (white), `bg-stone` (pierre dorée: hero frame and footer
only), `text-ink`, `text-ink-soft` (secondary on white), `text-on-navy`, `text-on-navy-soft`,
`border-line` (rules on white), `border-field` (form fields), `border-line-navy`, `text-error`.
Type sizes: `text-[length:var(--text-h1)]`, `--text-h2`, `--text-h3`, `--text-display`; body is 18 px.
Headings are Spectral 300 (h1/h2) or 500 (h3), sentence case. No tracked all-caps labels, no eyebrow labels
above headings, no `A · B · C` meta strings, no `→` on buttons, no emoji, no gradient washes, no
identical card grids, no left-border cards.
Surfaces: put `on-navy` on any navy section (switches button and focus styles). Buttons: `btn btn-solid`
(primary) and `btn btn-line` (secondary) — on navy they invert automatically. Standalone nav links:
`link-draw`. In-text links: `underline`. Tabular prices: `tnum`. Small caps: `smcp`.
Layout: container `mx-auto max-w-[84rem] px-4 sm:px-8 lg:px-12`; section rhythm `py-16 sm:py-24`;
prose width `measure` (36em). Mobile-first; no horizontal scroll at 360 px.

## Components you can use
- `@/components/media/Photo` — `<Photo id alt sizes ratio? focal? priority? className? imgClassName? />`
  (ids = keys of `src/lib/images.generated.json`; alt texts and focal points are in `content/gallery.json`).
- `@/components/motion/Door` — wraps a `<Photo>`; reveals it with the door leaves (M2m) automatically.
- `@/components/status/StatusLines` + `@/components/status/StatusScript` — live status; put the script
  right after the lines.
- `@/components/visit/HoursPlaque` — address plaque + week table + buttons (`withAppleMaps` option).
- `@/components/menu/MenuList`, `@/components/menu/ArdoiseLine`.
- `@/components/ui/AlcoholNotice` — REQUIRED on any page/block showing wine, champagne, Chartreuse or
  digestifs (carte desserts included).
- `@/components/reviews/Reviews` — rating line (`compact`) or gated excerpts.
- `@/components/seo/JsonLd` — `RestaurantJsonLd`, `MenuJsonLd`, `WineMenuJsonLd`.
- Data: `@/lib/data` (`site`, `menu`, `wines`, `hours`, `gallery`, `reviews`, `euro()`, `weekTable`,
  `hoursSentence`, `directionsUrl`, `appleMapsUrl`, `frenchDate()`).

## Content rules (binding)
- French copy, plain and specific, no agency-speak (« expérience culinaire », « voyage gustatif »…).
- French typography: « guillemets » with U+202F inside, U+202F before ; : ! ? and before €, apostrophe ’
  in visible text is fine as `&apos;` in JSX.
- Never invent facts: prices, dishes, wines, hours, capacities, biographies, awards. Unknown → leave out
  (do not print « [À CONFIRMER] » on public pages; list the gap in your report instead).
- Dish and wine names verbatim from the content files. Allergens: per-dish values are shown only when
  `allergensValidatedAt` is set (none are today) — show the legend and the fixed sentence instead.
- Alcohol: neutral wording only (appellation, domaine, millésime, région), no festive copy, AlcoholNotice.

## Accessibility (WCAG 2.2 AA)
Real `<button>`, `<a href>`, `<label for>`; targets ≥ 44 px (`min-h-11`); visible focus (global);
headings in order (one `h1` per page); `aria-current="page"` handled by the header; images with the alt
texts from `content/gallery.json`; dialogs = native `<dialog>`; never rely on hover; reduced motion
respected (CSS already handles door/wall/M1).

## Page metadata
Each page exports `metadata` with a unique `title` (template adds « | Restaurant Comme Avant, Dardilly »),
a `description` (≤ 155 chars, mentions Dardilly), and `alternates: { canonical: "/path/" }`.

## Verify before you finish
`npm run typecheck` and `npx next build` must pass. Do not edit files outside your ownership list
(shared components, globals.css, layout, content files) — if you need a change there, describe it in your
report instead.
