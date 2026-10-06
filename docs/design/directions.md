# Phase 2 — Art directions (spec v2, after adversarial critique)

v1 was reviewed by three independent critics (creative director, owners + conversion, accessibility +
front-end feasibility); raw notes in the session, decisions below. Main changes: Jost dropped (its
splayed Futura M contradicts the logo's vertical-stem Montserrat M), cream reading surface dropped
(too close to the generated-site default), arch photo masks, tile frieze, rosette bullets and gold
hairlines dropped (kitsch / luxury mispricing), terracotta UI dropped in A, B rebuilt as « Le Midi »,
C rebuilt on measured slate with the owners' own chalk handwriting as its only display voice.

## Ground truth used by every direction

- Logo: navy disc `#3D435B`, white Montserrat Medium capitals, cement-tile rosette as the O.
  Rebuilt as SVG in `assets/brand/` (reconstruction — ask the sign maker for the original file).
- Sign at the door (photo 210926): flat navy panel `#17213B`–`#182745` on pierre dorée `#A78547`,
  with a clip frame underneath: « Le restaurant est ouvert du mardi au samedi midi de 11h30 à 14h et du
  jeudi au samedi soir de 19h30 à 21h30 — Réservation au 04.78.66.19.57 ». The sign already does the
  conversion job: the site continues it.
- Interior: pierre dorée, cement-tile runner (terracotta lattice, cream squares, blue-grey diamonds),
  navy glazed bar tiles, terracotta wall with the quarter-round glazed Chartreuse cellar, rattan
  pendants, backlit wine wall. Terrace: octagon mosaic tables under magnolias.
- Photos we own today: sharp daylight top-down dishes on the terrace mosaic, evening interiors,
  one low-key reference (pâté en croûte, owner's retouch). No terrace or team photo yet.
- Service mix: 5 lunches (Tue–Sat) and 3 dinners (Thu–Sat) a week. Lunch formulas 21 € / 25 €
  Tue–Fri [À CONFIRMER]. Parking on site. Six Google reviews supplied by the owner (5/5, no names).

## Rules shared by all directions

- Real content only; unknowns marked `[À CONFIRMER]`. Reviews quoted verbatim with « Avis Google, 5/5 »
  and a link to the listing; no names invented.
- Reading surfaces (carte, hours, booking) are dark text on a light ground in A and B (positive
  polarity reads best outdoors). C states the dark-ground sunlight risk openly.
- Prices: lining tabular figures, « 7,50 € » with a narrow no-break space. Appellations in small caps.
- No tracked all-caps labels or eyebrows, no `A · B · C` meta strings, no `→` on buttons, no emoji,
  no card kit. Links in running text are underlined. Focus ring 2 px, offset 3 px, per surface.
- Status « Ouvert / Fermé » computed from `hours.json` (Europe/Paris, holidays, closures,
  `verifiedThrough`) into a reserved slot (no layout shift).
- Motion (the brief asks for an orchestrated intro, progressive reveals and an optional pinned story):
  one intro sequence per direction that animates only already-painted elements with transform/opacity
  (the LCP text and image are visible from the first frame), one pinned sequence where it tells
  something real, and interaction motion (booking sheet, allergen toggle, carte chips). No per-section
  fade-up on every block, no loader. `prefers-reduced-motion`: all static.
- Mobile sticky bar: Réserver / Appeler / Itinéraire, shown once the hero has scrolled out.

---

## A — « L'Enseigne » (recommended)

**Idea.** The website continues the sign at the door. The memorable element is **l'affiche de la
porte**: the navy panel with the wordmark and, under it, the white clip-frame notice in the house's own
words — made live (« Ouvert ce midi jusqu'à 14 h », formules, phone, Réserver).

**Palette (4 tokens).** Bleu enseigne `#17213B` (hero panel, cave, reviews) · Blanc `#FFFFFF`
(notice sheet, carte, hours, booking: navy text 15.9:1) · Pierre dorée `#A78547` (the wall around the
hero panel and the footer only; navy on it 4.6:1, used for large text only) · Disque logo `#3D435B`
(inside the logo only). Terracotta and rattan live only in the photographs.

**Type.** Spectral (Production Type, Paris) for everything: headings 300/400 in sentence case, dish
names 500, text 400 + italic, UI 500; small caps for appellations; tabular prices. Montserrat Medium
only where the real sign uses it: the wordmark (SVG) and the address plaque (« Nous trouver »).

**Buttons.** On white: navy fill, white text. On navy: white fill, navy text (the sign in reverse).

**Photography.** Rectangles at the triage crops, never masked. Daylight dishes on white blocks with an
honest caption (« Quelques assiettes des derniers mois »); rooms and evening shots full-bleed on navy.

**Motion.** Intro: the notice sheet slides up 12 px out of the panel's slot and the hero photo of the
salle settles from scale 1.04 to 1 (900 ms, ease-out; text painted from frame one). Pinned story on
desktop: « Entrer chez Comme Avant » — four steps (la ruelle, la porte, la salle, la cave) with the
photo crossfading while the text changes; on mobile and reduced motion, four stacked blocks.

**Homepage.** Affiche hero (panel + live notice + salle photo) → Google rating line, dated and linked →
La carte on white (today's ardoise line, formules midi, entrées, plats, fromages, desserts with prices;
« Toute la carte et les vins ») → Entrer chez Comme Avant (pinned) → La cave in round-headed text cells
mirroring the backlit wall (3–5 picks per region, Loi Évin line) → 3 avis Google → « Nous trouver »
plaque (week table with today highlighted, address, parking sur place, Itinéraire) → closing image (the
chocolate plaquette « Restaurant Comme Avant Dardilly ») → footer: the panel again on stone, phone large.

## B — « Le Midi »

**Idea.** A lunch-first, daylight site built on the photos the house owns today: sharp top-down dishes
on the terrace mosaic. The memorable element is the **plate at noon**: one large 4:5 dish photo with
the white « aujourd'hui » card set under it like a bill.

**Palette.** Blanc `#FFFFFF` ground · Marine `#22304F` text · Terre cuite `#B4563A` (measured on the
floor) CTA fill only, white text 4.85:1 · Bleu-gris `#8FA3B8` non-text rules only.

**Type.** Literata alone (optical sizes): display at large opsz, carte and UI at text opsz, sentence
case, small caps and tabular figures.

**Motion.** Intro: the « aujourd'hui » card rises 16 px over the photo edge (700 ms). Carte chips and
booking sheet only. Pinned story: none (the content is the carte).

**Homepage.** Plate + aujourd'hui card (hours, formule midi, phone, Réserver) → La carte du moment
(list with prices, 3–4 recent dishes with captions) → Le soir et la cave (short block) → La terrasse
[séance photo] → avis → Nous trouver → footer.

## C — « L'Ardoise »

**Idea.** The board is the house: the owners' real chalkboard, photographed each day, is the hero and
the only display voice. Ground = the measured slate of the reference photo.

**Palette.** Ardoise `#2A2A2C` ground · Craie `#ECEBE6` text (13.4:1) · Craie fill with slate text for
the CTA · borders ≥ 3:1. No accent colour.

**Type.** Alegreya alone (text, UI, prices), small caps and tabular figures; the handwriting comes only
from the real ardoise photo (typed text beside it is the source of truth for screen readers and SEO).

**Motion.** Intro: the ardoise photo brightens from 85 % to 100 % exposure via an overlay fade
(600 ms). No pinned story.

**Risks (honest).** Needs the professional shoot (low-key dishes) and a daily photo of the board by the
owners; dark ground reads worse in direct sunlight.

## Recommendation

**A « L'Enseigne »**: it continues what customers already see at the door (sign, logo, napkins, navy bar
tiles), carries the live practical information as its signature, works with today's photos, and keeps
reading surfaces in dark-on-white. From C it borrows the typed, server-dated ardoise line at the top of
the carte; from B the honest captions on dish photos.
