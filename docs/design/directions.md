# Phase 2 — Art directions (spec)

Grounding (observed, not invented): logo = slate-navy circle `#3D435B` with white geometric capitals
(close to Montserrat Light) and a cement-tile rosette as the O; outdoor sign = deeper navy `#182745`,
same capitals; interior = pierre dorée walls (`#887156` / `#A78547`), carreaux de ciment floor
(terracotta `#B4563A`, cream `#E8DCC6`, navy `#2B3550`, pale blue-grey `#8FA3B8`, black), navy glazed
bar tiles (`#24345E`), terracotta painted wall `#A26348` with an arched Chartreuse cellar, rattan
pendants (`#BB8354`), backlit arched wine niches, a segmental stone arch over the bar; terrace with
octagon mosaic tables (cream/terracotta) under magnolias; owner's reference photo = low-key food on
black slate. Content facts: see `docs/content/owner-input-2026-10-06.md` and `docs/research/`.

Hours confirmed by the sign photo (210926): lunch Tue–Sat 11:30–14:00, dinner Thu–Sat 19:30–21:30.
Phone 04 78 66 19 57. Address 3 place de l'Église, 69570 Dardilly. Parking on site (owner).

Rules for all directions: real content only (unknowns as `[À CONFIRMER]`), no fake reviews (the six
Google reviews supplied by the owner, 5/5, no names), French copy, AA contrast, touch targets ≥ 44 px,
one memorable element per direction, no eyebrow labels above every heading, no `A · B · C` meta strings,
no `→` appended to buttons, no emoji, no stock imagery. Mobile sticky bar: Réserver / Appeler / Itinéraire.

---

## A — « L'Enseigne » (recommended)

**Idea.** The site wears the restaurant's own sign: deep navy, white geometric capitals, the
cement-tile rosette of the logo. Photographs open like the arches of the house.

**Palette**
| Token | Hex | Use |
|---|---|---|
| bleu-enseigne | `#17213B` | page ground, header, footer |
| bleu-logo | `#3D435B` | raised panels on navy, logo circle, dividers |
| blanc | `#FFFFFF` | wordmark, headings on navy |
| ivoire | `#ECE7DD` | body text on navy (12.9:1) |
| creme-carreau | `#EFE7D6` | reading surface for the carte and practical info (paper) |
| encre | `#17213B` | text on creme (same navy) |
| terre-cuite | `#A3452C` | primary CTA « Réserver », active states (white text 6.1:1) |
| pierre | `#C29A5B` | rosette fleurons, arch keylines, focus ring on navy |

**Type.** Jost (Futura lineage, 1927 — the era of enamel shop signs) 300/400/500 in capitals,
+0.14em tracking, only for the name, section titles and the plaque; Spectral (Production Type, Paris)
400/500/italic for everything read: dishes, descriptions, stories, reviews. Prices in Jost with
tabular figures.

**Shapes.** Photo frames topped by the *arc surbaissé* of the stone arch over the bar (rise ≈ 18 % of
width) with a 1 px pierre keyline offset 8 px; full semicircle arches reserved for the cave (wine
niches). The rosette = bullet, open-now marker, loader, favicon. A single-row cement-tile frieze marks
navy → paper transitions. 12-column grid, axial (centred, symmetric like the wine wall) alternating
with off-axis text/photo pairs.

**Photography.** Graded set inside arches on navy; daylight dishes keep their mosaic backgrounds
(the arch makes the shape intentional).

**Motion.** One orchestrated hero: the four fleurons of the rosette turn 90° and lock (700 ms,
ease-out), the wordmark settles, then the hero arch opens (clip-path, 900 ms). Each section's first
arch opens once on scroll. Reduced motion: everything static, already open.

**Homepage (mobile first).** Navy header (rosette + Comme Avant + Menu) → hero: wordmark, arch photo of
the wine wall, live status « Ouvert, service du midi jusqu'à 14 h », « Réserver une table » +
phone → « Une maison de village » (two arches: arch + bar, Chartreuse cellar) → « À la carte en ce
moment » on paper (entrées / plats / desserts with prices) → Broche du jour (selon arrivage) → Desserts
à la Chartreuse → La cave (Rhône, Beaujolais, Bourgogne, 100+ references) → Avis Google (3 of 6) →
plaque « Nous trouver » (address, hours, parking on site, phone, itinéraire) → footer with the large
phone number over the tile frieze.

---

## B — « Le Carreau »

**Idea.** The floor and the terrace tables are a system: everything sits on a square tile module and
the eight-point star of the cement tiles is the generative pattern. A sunny, lunch-and-terrace site.

**Palette**
| Token | Hex | Use |
|---|---|---|
| gris-bleu | `#DCE3E7` | page ground (the pale tile) |
| marine | `#22304F` | text, dark tiles, footer |
| terre-cuite | `#B04F35` | accent tiles, primary CTA (white text 5.2:1; as text on gris-bleu only ≥ 24 px, 4.0:1) |
| creme | `#F3EDE2` | tile cream, cards on ground |
| noir-carreau | `#151515` | small triangles in the pattern only |
| rose-terrasse | `#C98A7A` | terrace chairs: rare decorative accent, never text |

**Type.** Archivo Expanded 600/700 for display (sturdy, like a tile catalogue), Archivo for UI;
Literata 400/italic for dishes and text.

**Shapes.** Squares and octagons with cabochons (the terrace mosaic) as photo masks; frieze of
eight-point stars between sections; menu as a tiled grid.

**Photography.** Top-down dishes on the mosaic table (poulpe, moelleux) are the heroes; square crops.

**Motion.** On load the frieze lays itself tile by tile (40 ms stagger); dish tiles flip to their
description on tap / focus. Reduced motion: no flip, description visible below.

**Homepage.** Hero = 2 × 2 tile mosaic (poulpe, moelleux, allée de carreaux, enseigne) with the name
on a cream tile and the status on a terracotta tile → carte as tiles → terrasse → avis → infos.

---

## C — « L'Ardoise »

**Idea.** Dinner by lamplight. The ground is the warm black of the slate photograph; photos bleed
edge to edge; the live element is the real daily chalkboard (photo + live text).

**Palette**
| Token | Hex | Use |
|---|---|---|
| ardoise | `#15130F` | ground |
| ardoise-claire | `#25221E` | surfaces |
| ivoire | `#EFE7D8` | text (15.1:1) |
| rotin | `#C69259` | links, prices, accents (6.8:1) |
| chartreuse | `#D9C85E` | live status only |

**Type.** Gloock (warm high-contrast serif) for display and dish names; Karla for UI and text.

**Risk (honest).** Warm black + one warm accent is close to a common generated-site look, and the
direction needs low-key photography we do not have yet (only the pâté reference and one dessert):
it depends on the professional shoot.

---

## Recommendation

A, borrowing B's tile frieze (as separator only) and C's real daily ardoise (as the « Broche du jour /
ardoise » block). Reasons: it extends what customers already see (sign, logo, napkins, navy bar tiles)
so the site is recognisably *this* house; navy holds both daylight and evening photos; white on navy
gives very high contrast for outdoor mobile reading; no restaurant template looks like it.
