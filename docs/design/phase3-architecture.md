# Phase 3 — Architecture, UX and motion (direction A « L'Enseigne ») — v2

v1 was reviewed by three adversarial lenses (UX/conversion, motion+performance+accessibility,
local SEO + French law). This v2 integrates the endorsed changes; the review synthesis is archived in
`docs/research/phase3-review.md`. Two arbitrations in favour of the client brief: the **Galerie page
stays in v1** (explicitly requested; built from today's photos) and the **home keeps a door-reveal
teaser** (the full « Entrer chez Comme Avant » story lives on /le-restaurant).

Content sources: `docs/content/owner-input-2026-10-06.md`, `docs/content/allergens-draft.md`,
`docs/research/restaurant-facts.md`. Design spec: `docs/design/directions.md` (A).

## 1. Sitemap, URLs, navigation

| URL | Page | Purpose |
|---|---|---|
| `/` | Accueil | decide in 10 s: status, Réserver/Appeler, carte teaser, hours |
| `/la-carte` | La carte | formules, ardoise line, entrées, plats, fromages, desserts, allergens, print, PDF |
| `/la-carte/vins` | Les vins | au verre / en pot, bottles by region, print, PDF, Loi Évin notice |
| `/le-restaurant` | Le restaurant | the house story (pinned « Entrer chez Comme Avant »), Magali et Fabrice, cave |
| `/galerie` | Galerie | editorial grid of today's photos + accessible lightbox |
| `/nous-trouver` | Horaires et accès | week table, exceptional closures, address, parking, itinéraire, map, contact |
| `/reserver` | Réserver | one booking-request form (groups expand in place, `#groupes`) |
| `/mentions-legales` | Mentions légales | LCEN fields, mediator, credits, accessibility section |
| `/confidentialite` | Confidentialité | RGPD notice (booking data, processors, OSM click-to-load) |
| `404` | — | « Cette page n'est plus à la carte. » + links |

- Kept slugs: `/la-carte` and `/nous-trouver` (already indexed on the current site).
- 301 redirects from the old Wix pages: `/menus` → `/la-carte#formules`, `/cartesdesvins` →
  `/la-carte/vins`, `/apropos` → `/le-restaurant`, `/contact` → `/nous-trouver#contact`, old cookie
  page → `/confidentialite`. Canonical host `www`, apex → www. Keep MX records when DNS moves.
- Previews (including the M1–M3 prototype link): access-protected + `X-Robots-Tag: noindex`.
- **Primary nav:** La carte · Les vins · Le restaurant · Galerie · Horaires et accès + button
  **Réserver**. One vocabulary everywhere (« Itinéraire » only for the directions link; never « Menu »
  for navigation).
- **Mobile header:** wordmark (link « Comme Avant, accueil ») · « La carte » · « Plus » (native
  `<dialog>`/popover, Esc closes, focus returns; contains the 5 entries, Réserver, today's status,
  phone, address). Hides on scroll down, reappears on scroll up; on /la-carte the chip nav replaces it.
- **Desktop header:** wordmark · 5 links · phone as text · Réserver.
- **Footer (every page):** canonical NAP « Restaurant Comme Avant, 3 place de l'Église, 69570 Dardilly,
  04 78 66 19 57 », hours summary, legal links, the Loi Évin line only where alcohol is shown.

## 2. The 10-second journey (mobile, from Google)

| Time | Visitor | Element |
|---|---|---|
| 0–2 s | navy affiche: wordmark (≈ 120 px), live status (2 lines), **[Réserver une table] [Appeler]** | hero, first viewport at 360×640 |
| 2–5 s | taps « La carte » (header) or scrolls: formules, ardoise line, dishes with prices | carte teaser |
| 5–10 s | acts: Réserver / Appeler / Itinéraire from the sticky bar | sticky bar (appears as soon as the hero CTA row leaves the screen) |

### 2.1 Live status — every state (exact copy, no countdown)

| State | Line 1 | Line 2 |
|---|---|---|
| lunch service running | Ouvert ce midi | service jusqu'à 14 h |
| before lunch (Tue–Sat) | Ouvert ce midi | de 11 h 30 à 14 h |
| between services (Thu–Sat) | Fermé cet après-midi | ce soir dès 19 h 30 |
| dinner running (Thu–Sat) | Ouvert ce soir | service jusqu'à 21 h 30 |
| after Tue/Wed lunch | Fermé ce soir | demain midi dès 11 h 30 |
| Sunday, Monday, after Saturday dinner | Fermé aujourd'hui | réouverture mardi à 11 h 30 |
| congés (announced 14 days ahead) | En congés jusqu'au … | réouverture le … |
| privatisation | Fermé ce soir (privatisation) | réouverture … |
| public holiday without owner entry | Jour férié | appelez pour vérifier au 04 78 66 19 57 |
| `verifiedThrough` passed | (no open/closed claim) | horaires habituels + « appelez pour confirmer » |

Once the owners give last-orders times: « Dernières commandes à … » replaces line 2 during service.
Implementation: the static HTML holds only the weekly sentence; a ≤ 1 KB inline script (Europe/Paris
via `Intl`, hours inlined at build) fills a reserved slot (`min-height: 2lh`) before paint; updates only
at state boundaries; no `aria-live`. Saturday dinner = 19 h 30 (the sign at the door is the primary
source; Google shows 19 h → to be corrected on the Google Business Profile).

### 2.2 Price line in the hero
Tuesday–Friday before 14 h: « Formules du midi : 2 plats 21 € · 3 plats 25 € ». Otherwise: « À la
carte : plats de 22 à 33 € » (computed from menu.json).

### 2.3 Other journeys
Group organiser: Réserver → party size ≥ threshold → group fields expand. « Ouvert ce soir ? »: hero
status → week table on /nous-trouver. Wine lover: « Les vins » → /la-carte/vins.

## 3. CTA hierarchy (depends on the status)

- **A same-day service is still to come or running:** [Appeler pour ce midi / ce soir] primary,
  [Réserver un autre jour] secondary (online requests for today are not processed in time).
- **Closed / after the last service:** [Réserver une table] primary, « Appeler » secondary with
  « aux heures d'ouverture » [À CONFIRMER].
- The sticky bar follows the same order. On desktop the phone is text (tel: secondary).
- **Itinéraire:** one static Google Maps directions link (place ID verified in the Business Profile);
  /nous-trouver adds « Ouvrir dans Plans ». Destination = the parking [À CONFIRMER] + « puis la ruelle
  piétonne, 1 min à pied ».
- Tertiary: « Lire les avis sur Google », « Toute la carte », « Tous les vins ».

## 4. Wireframes (text)

General rules: one sticky layer on top + the bottom bar; `scroll-padding` top/bottom so focus is never
hidden; under `max-height: 500px` bars become static; skip link « Aller au contenu »; after client
navigation focus goes to the page `<h1>`; focus = 2 px outline, 3 px offset (double ring over photos).

### 4.1 Accueil (mobile and desktop, same order)

```
┌──────────────────────────────────────┐
│ [Comme Avant]       [La carte] [Plus]│  header (navy)
├──────── pierre dorée frame ──────────┤
│        C◉MME AVANT (≈120 px)         │  navy panel = the sign
│ ┌──────────────────────────────────┐ │
│ │ Ouvert ce midi                   │ │  live status (2 lines, slot reserved)
│ │ service jusqu'à 14 h             │ │
│ │ [Réserver une table] [Appeler]   │ │  ≥ 44 px, order per §3
│ │ Formules du midi : 21 € · 25 €   │ │  price line §2.2
│ │ Le restaurant est ouvert du mardi│ │  the sign's own sentence
│ │ au samedi midi… et du jeudi au   │ │
│ │ samedi soir…                     │ │
│ └──────────────────────────────────┘ │
├──────────────────────────────────────┤
│ photo salle (arche + bar)            │  M1 settle
├──────────────────────────────────────┤
│ 4,8/5 sur Google, 102 avis au [date] │  linked
├──────────── white ───────────────────┤
│ La carte                              │
│ Ardoise (if dated today) / generic    │
│ Entrées · Plats (names left, prices right) │
│ 2 dish photos « Quelques assiettes des derniers mois » │
│ [Toute la carte]                      │
├──────────── navy ────────────────────┤
│ one salle photo, door-reveal teaser   │  M2m (once)
│ « Entrer chez Comme Avant » → /le-restaurant │
├──────────── navy ────────────────────┤
│ La cave: round-headed text cells      │  M3 « le mur s'allume »
│ 3–5 picks per region · Loi Évin line  │
├──────────── white ───────────────────┤
│ 2–3 review excerpts (author, date, Google) │
├──────────── white ───────────────────┤
│ Horaires et accès plaque: week table (today), parking, Itinéraire │
├──────────── pierre dorée ────────────┤
│ footer: the panel again, phone large, NAP, legal │
└──────────────────────────────────────┘
 sticky bar (when the hero CTA row is off-screen): Réserver · Appeler · Itinéraire
```
Desktop: hero in two halves (affiche on the stone field | salle photo full height), carte teaser in
two columns, cave grid, reviews in three columns.

### 4.2 Reviews (legal rules)
2–3 short excerpts from reviews 1 (typo-free segment only), 3, 4, 6 — not 2 (alcohol offered) nor 5
(« fait maison » is a regulated claim). Each excerpt shows the author name and date exactly as on
Google + link. Under them: « Extraits d'avis publiés sur Google, choisis par le restaurant ; ces avis
ne font pas l'objet d'une procédure de vérification par le restaurant. Note moyenne 4,8/5 sur 102 avis
au [date]. » No review or aggregateRating in JSON-LD.

### 4.3 La carte
- Sticky chip nav (Ardoise · Formules · Entrées · Plats · Fromages · Desserts · Vins); scroll-spy with
  `aria-current`; « Vins » links to /la-carte/vins.
- Ardoise line only when dated today; otherwise « Suggestions et broche du jour selon arrivage, sur
  l'ardoise au restaurant ».
- Names left, prices right in tabular figures; dish names verbatim; meat origin shown (required).
- **Allergens:** no « végétarien » / « sans gluten » filters. Toggle « Afficher les allergènes » shows,
  per dish, one SVG pictogram + the text name; it ships only for dishes validated by the owners
  (`allergensValidatedAt`, « Allergènes vérifiés le … »); hidden if none validated. Legend of the 14 in
  a `<details>`. Ardoise/broche: « Allergènes : demandez-nous ». Fixed copy: « Le tableau des
  14 allergènes de chaque plat est consultable librement au restaurant. Une allergie ? Signalez-la par
  téléphone ou à votre arrivée. Cuisine non exempte de traces. »
- Price mentions: « Prix nets en euros, service compris ([taux À CONFIRMER] %) »; formules « du mardi
  au vendredi midi, boisson non comprise [À CONFIRMER] »; « Carte en vigueur au … ».
- « Imprimer la carte » (print stylesheet) and « Télécharger le PDF » (dated, generated at build);
  separate for the carte and the wines.

### 4.4 Les vins
Au verre / en pot (12, 25, 46 cl), then bottles by region in native `<details>` (Rhône, Bourgogne,
Beaujolais, Loire, Provence, Languedoc, Bordeaux, Savoie, Cévennes, bulles); « Millésimes selon
disponibilité »; `<AlcoholNotice/>` on the page, in print and PDF. Wording: appellation, domaine,
millésime, cépage, region only — no festive or promotional wording.

### 4.5 Le restaurant
The house in three steps with the pinned M2 on desktop: la ruelle (medium framed image) → la salle →
la cave (Chartreuse niche). Terrace chapter and the full 4-step version after the photo shoot.
« Magali et Fabrice Guillon » named without roles or biography until confirmed. Optional line
« anciennement Les Terrasses de Dardilly » if the owners agree.

### 4.6 Galerie
Editorial grid of ~12 retouched photos at their triage ratios (4:5, 1:1, 3:2 — no identical cards),
dishes captioned « assiettes des derniers mois ». Lightbox: native `<dialog>`, visible Précédent /
Suivant / Fermer buttons (≥ 44 px), swipe as an extra, « Photo 3 sur 12 », focus returns to the
thumbnail, alt and caption never identical. Grows with the shoot.

### 4.7 Réserver (booking + groups, one form)
Server-rendered form via a Server Action (works without JS):
- date: `<select>` of the next open dates (horizon [À CONFIRMER, default 60 days]) computed from
  hours.json minus closures; re-validated on the server;
- service midi/soir (closed services disabled, reason in `aria-describedby`); heure souhaitée
  (15-min slots up to last seating [À CONFIRMER]); couverts; nom; téléphone (required); e-mail
  (optional, « pour recevoir le récapitulatif »); note (« terrasse, occasion, poussette… »);
- couverts ≥ [8 À CONFIRMER] → group fields expand in place (occasion, privatisation souhaitée,
  budget par personne optional) + phone offered;
- today / after the cut-off [À CONFIRMER] → « Appelez-nous » with the phone button;
- no allergy field (« Une allergie ? Dites-le-nous au téléphone ou en arrivant. »);
- inline errors + error summary; honeypot + minimum fill time + rate limit (no captcha);
- RGPD line under the button (art. 6.1.b, deletion at 3 months, link to Confidentialité);
- **success** (focus on heading): recap + « Demande envoyée, pas encore confirmée. Nous vous
  confirmons votre table par téléphone ou par e-mail [délai À CONFIRMER]. Sans réponse de notre part,
  appelez le 04 78 66 19 57. » + weekend processing note [À CONFIRMER]; automatic acknowledgment
  e-mail if an address was given. Never « réservation confirmée »;
- **failure:** data kept, message, phone shown large;
- delivery: transactional e-mail from an EU provider to up to two addresses (SPF/DKIM/DMARC) + a copy
  in an EU-region store auto-deleted after 3 months.

### 4.8 Horaires et accès
Canonical NAP; Itinéraire + « Ouvrir dans Plans »; parking and walking note [À CONFIRMER]; week table
with today highlighted, closures and congés; phone; e-mail [À CONFIRMER]; « Accès PMR : [À CONFIRMER] »;
static illustrated map of the village centre + « Afficher la carte interactive » (OpenStreetMap loaded
only on click, ODbL attribution, disclosed in Confidentialité). No Google Maps or social embeds.

### 4.9 Legal
`legal` block in site.config.ts: raison sociale (LE COMPTOIR SARL [À CONFIRMER — Kbis]), enseigne,
forme, capital, siège, RCS, SIREN/SIRET, TVA intracom., directeur de la publication, contact, hébergeur,
**médiateur de la consommation** (mandatory), credits (photos © the owners, logo reconstruction,
Spectral/Montserrat SIL OFL). The production build fails if a legal field is still a placeholder.
Accessibility section (target WCAG 2.2 AA, test date, known limits, phone for an accessible version of
the carte; no conformity claim). Confidentialité: controller, purposes, retention, processors, logs,
OSM click-to-load, rights, CNIL; « Aucun cookie soumis à consentement : pas de bandeau ».

## 5. Motion design — creative but disciplined

Principles: motion says something about the house or answers an action; transform/opacity only; the
LCP text and image are painted from the first frame; libraries are route-scoped and lazy; every motion
has a reduced-motion / print / no-JS fallback.

| # | Name | Where | What happens | Tech | Fallback |
|---|---|---|---|---|---|
| M1 | **L'affiche s'accroche** | home hero, hard loads | the notice rises 12 px into the panel; the salle photo settles 1.04 → 1 (≤ 900 ms, opacity stays 1) | pure CSS keyframes | none |
| M2 | **Entrer chez Comme Avant** | /le-restaurant, desktop | sticky photo stage; each photo revealed by **two navy door leaves sliding apart** (translateX), scrubbed by the scroll; text blocks stay in normal reading order | GSAP ScrollTrigger (scrub only, lazy, desktop only) | stacked blocks, photos visible |
| M2m | **La porte s'ouvre** | home teaser + /le-restaurant mobile | the leaves open once when the photo enters the screen | IntersectionObserver + CSS | open |
| M3 | **Le mur s'allume** | home cave + /la-carte/vins | the round-headed cells light up one after another like the backlit wine wall (glow opacity, 60 ms stagger, once) | IntersectionObserver + CSS | lit |
| M4 | **La carte vivante** | /la-carte | chip indicator slides (translateX + scaleX); allergen lines fade in as one block (150 ms) | CSS + tiny JS | instant |
| M5 | **Statut vivant** | hero, Plus sheet, /nous-trouver | status filled before paint, changes only at state boundaries (crossfade) | inline script | instant swap |
| M6 | **Passer la porte** | page changes | header stays, `main` crossfades with an 8 px rise; progressive enhancement, dropped if it fails QA on Safari/Firefox | View Transitions (experimental in Next 16) | none |
| M7 | Micro-interactions | everywhere | press 0.98; underline drawing on nav links; « Plus » sheet with `@starting-style`; group fields expanding; lightbox zoom from the thumbnail | CSS + Motion (route-scoped) | instant |
| M8 | Smooth scroll | /le-restaurant desktop only | gentle Lenis synced with ScrollTrigger | Lenis (lazy) | native |

Before building every page, M1, M2/M2m and M3 are prototyped and shared as a protected preview link.

## 6. Stack, performance, content editing

- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4; Motion (LazyMotion, route-scoped); GSAP +
  ScrollTrigger + Lenis only on /le-restaurant desktop via `import()` (GSAP is free for commercial use,
  plugins included, since April 2025); Lucide icons (stroke 1.5); fonts self-hosted with
  `next/font/local` (Spectral subsets with small caps and tabular figures; only Spectral 400/500
  preloaded; the wordmark is SVG).
- Budget: first-load JS on `/` and `/la-carte` ≤ 130 KB gzip; Lighthouse CI mobile ≥ 95 on the four
  categories for every page; LCP ≤ 2.0 s, CLS ≤ 0.05, TBT ≤ 150 ms. Mobile hero image AVIF ≈ 720 px
  ≤ 70 KB with `fetchPriority="high"`; desktop art-directed `<picture>`; never two preloaded heroes.
- Privacy: no cookie banner (no tracker); no Google Fonts link, analytics, reCAPTCHA or embeds;
  Phase 5 checks zero third-party requests and zero cookies on first load.
- **Content editing without code:** Keystatic (edits the same files in the repo from a phone; each
  save rebuilds the site in 1–2 min). Files: `content/site.config.ts` (NAP, legal, social),
  `content/hours.json` (services, closures, holidays, `verifiedThrough`), `content/menu.json` (dishes,
  prices, origin, allergens, `effectiveFrom`), `content/wines.json`, `content/ardoise.json` (off by
  default), `content/reviews.json` (excerpts with author/date), `content/gallery.json`.
- Maintenance:

| File | When | Who | Fallback if stale |
|---|---|---|---|
| hours.json | congés, closures, privatisations; renew `verifiedThrough` quarterly | owners | no open/closed claim, weekly hours |
| ardoise.json | daily, only if enabled | owners | generic ardoise line |
| menu.json / wines.json | each carte change | owners | « Carte en vigueur au … » |
| reviews.json | when the rating line is refreshed | owners / us | dated line |

- JSON-LD: one `@graph` (Restaurant + Menu with MenuSection/MenuItem/offers in EUR; wines as a second
  Menu; openingHoursSpecification; special hours only for owner-entered closures; no aggregateRating).
- Local SEO: one canonical NAP; titles pair the name with « Dardilly » (homonym in Crépy-en-Valois);
  Google Business Profile links to /la-carte and /reserver; cleanup of the old « Les Terrasses de
  Dardilly » listings in Phase 6.

## 7. Acceptance tests (Phase 5)

1. Hero CTA row fully visible, or sticky bar visible at load, at 360×640, 375×553, 390×844, 412×823,
   at 100 % and 200 % text, with the longest status string.
2. Sticky bar appears as soon as the CTA row leaves the screen and never covers a focused field.
3. No time-dependent text in the static HTML; status logic unit-tested for every state (fixed
   Europe/Paris clock, DST edges).
4. Booking works with JavaScript disabled; failure path shows the phone.
5. axe + Lighthouse CI thresholds; keyboard-only pass; screen readers (VoiceOver, NVDA); 200 % / 400 %
   zoom; forced colours; reduced motion; 60 fps traces for M1–M3 at 4× CPU slowdown.
6. Zero third-party requests and cookies on first load; redirect map returns 301s.

## 8. Owner inputs

**Needed before building (Phase 4):**
1. Hosting: Vercel Pro (≈ 20 $/month) or Netlify (free tier allows commercial use).
2. Booking requests: which e-mail address(es) receive them, how fast you confirm, cut-off for online
   requests (beyond: « appelez-nous »), how far ahead people can book.
3. Who updates the site from a phone, and whether you commit to updating the daily ardoise (otherwise
   it stays off).

**Needed before going live (placeholders until then):** Kbis / INSEE notice of the operating company,
publication director, consumer mediator; last-orders times, phone hours, public holidays, congés
2026-2027; allergen table validation, parmesan (vegetarian), meat origins; service rate, « boisson non
comprise », coupe/kir volumes, menu enfant and Saturday lunch formula; group threshold, capacity,
privatisation; parking location, wheelchair access, payment methods, terrace season; exact spelling and
roles of Magali and Fabrice, who confirms bookings; Google review author names and dates for excerpts
1, 3, 4, 6 and today's rating/count; Google Business Profile manager access; old listings; Instagram
handle; « anciennement Les Terrasses de Dardilly » yes/no; domain registrar and access; photo shoot date.
