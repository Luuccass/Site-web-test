# Phase 3 — Architecture, UX and motion (direction A « L'Enseigne »)

Draft for owner validation. Content sources: `docs/content/owner-input-2026-10-06.md`,
`docs/research/restaurant-facts.md`. Design spec: `docs/design/directions.md` (A).

## 1. Sitemap

Primary navigation (5 entries + CTA): **La carte · La maison · Galerie · Groupes · Venir** and the
button **Réserver**. On mobile the header shows the wordmark, « La carte » and « Réserver »; the other
entries sit behind a « Rubriques » toggle.

| URL | Page | Purpose |
|---|---|---|
| `/` | Accueil | decide in 10 s: status, hours, carte, phone, booking |
| `/carte` | La carte | the full carte with prices, filters, allergens, wines; print view; PDF |
| `/carte#vins` | Les vins (section of /carte) | au verre / en pot, then bottles by region |
| `/la-maison` | La maison | the house, the rooms, the terrace, the cellar, Magali et Fabrice |
| `/galerie` | Galerie | editorial grid + keyboard-accessible lightbox |
| `/groupes` | Groupes et privatisation | groups, private events, request form |
| `/reserver` | Réserver | booking request form + phone, confirmation screen |
| `/venir` | Venir | address, map (click-to-load), parking, itinéraire, hours, contact |
| `/mentions-legales` | Mentions légales | legal notice (company LE COMPTOIR SARL, fields to complete) |
| `/confidentialite` | Confidentialité | privacy policy (form data, no tracking by default) |
| `404` | Page introuvable | « Cette page n'est plus à la carte. » + links |

Technical: `sitemap.xml`, `robots.txt`, JSON-LD (Restaurant, Menu, openingHoursSpecification,
specialOpeningHoursSpecification), Open Graph image 1200×630, canonical URLs, `lang="fr"`.

## 2. The 10-second journey (mobile, arriving from Google)

| Time | What the visitor sees / does | Element |
|---|---|---|
| 0–2 s | The navy affiche: wordmark, « Ouvert ce midi, service jusqu'à 14 h », phone, Réserver | hero, no scroll needed |
| 2–5 s | Taps « Voir la carte » (or scrolls one screen): today's ardoise line, formules 21 € / 25 €, then the carte with prices | carte teaser |
| 5–10 s | Acts from the sticky bar (appears after the hero): Réserver (form sheet) · Appeler (`tel:`) · Itinéraire (Maps deep link) | sticky bar |

Other journeys: a regular checks « Ouvert ce soir ? » (hero status + week table on /venir); a group
organiser goes La maison → Groupes → request form; a wine lover goes La carte → Les vins.

## 3. CTA hierarchy

1. **Réserver une table** — primary everywhere (navy fill on white, white fill on navy).
2. **Appeler** — co-primary on mobile (phone written in full, `tel:+33478661957`); same-day and
   groups ≥ 8 are steered to the phone.
3. **Voir la carte** — secondary (outline button / underlined link).
4. **Itinéraire** — in the sticky bar and on /venir (Apple Maps on iOS, Google Maps elsewhere).
5. Tertiary: « Lire les avis sur Google », « Toute la carte et les vins », « Demande pour un groupe ».

## 4. Wireframes (text)

### 4.1 Accueil — mobile (390 px)

```
┌──────────────────────────────────────┐
│ [La carte]                 [Rubriques ▾]│  header on navy
├──────── pierre dorée border ─────────┤
│            RESTAURANT                │
│      C◉MME AVANT  (logo SVG)         │  navy panel = the sign
│             DARDILLY                 │
│ ┌──────────────────────────────────┐ │
│ │ Ouvert ce midi                   │ │  white notice sheet (live)
│ │ Service jusqu'à 14 h (encore 1 h 20)│
│ │ Le restaurant est ouvert du mardi │ │  the sign's own wording
│ │ au samedi midi… jeudi au samedi soir│
│ │ Formules du midi : 21 € et 25 €  │ │
│ │ Réservation au 04 78 66 19 57    │ │
│ │ [Réserver une table] [Voir la carte]│
│ └──────────────────────────────────┘ │
├──────────────────────────────────────┤
│ photo salle (arche + bar), full bleed│
├──────────────────────────────────────┤
│ 4,8/5 sur Google · lien (dated)      │
├──────────── white ───────────────────┤
│ La carte                              │
│ Ardoise du jour : broche selon arrivage│
│ Formules du midi 21 € · 25 €          │
│ Entrées (3) · Plats (5+broche)        │  name left, price right
│ Fromages · Desserts                   │
│ [Toute la carte et les vins]          │
├──────────── navy ────────────────────┤
│ Entrer chez Comme Avant (4 temps)     │  ruelle → porte → salle → cave
├──────────── navy ────────────────────┤
│ La cave : cellules à tête arrondie    │  3–5 picks / region + Loi Évin
├──────────── white ───────────────────┤
│ Quelques assiettes des derniers mois  │  honest caption, 3 photos
├──────────── navy ────────────────────┤
│ Avis Google (3 of 6)                  │
├──────────── white ───────────────────┤
│ Nous trouver: plaque, semaine (aujourd'hui surligné), parking, Itinéraire │
├──────────── pierre dorée ────────────┤
│ footer: the panel again, phone large, legal links │
└──────────────────────────────────────┘
 sticky bar after the hero: [Réserver] [Appeler] [Itinéraire]
```

### 4.2 Accueil — desktop (1440 px)
Hero in two halves: left the navy affiche on the stone field, right the salle photo full height. Then
the carte in two columns (entrées + plats | fromages + desserts), the pinned « Entrer » story, the cave
wall grid, the dish photos, reviews in three columns, Nous trouver with the static map, footer.

### 4.3 La carte
Sticky chip nav (Ardoise · Formules · Entrées · Plats · Fromages · Desserts · Vins) with scroll-spy;
filters (Végétarien, Sans gluten [À CONFIRMER per dish]); « Afficher les allergènes » toggle showing the
14 EU allergen codes per dish + a sticky legend; dish name left, price right (tabular). Wines: au verre
/ en pot table, then bottles grouped Rhône, Bourgogne, Beaujolais, others, collapsible on mobile.
Buttons: « Imprimer la carte » (print stylesheet = a real printed carte) and « Télécharger en PDF »
(generated at build time). Mention: « Prix nets, service compris. Tableau des allergènes disponible
sur demande au restaurant. » [À CONFIRMER] and the Loi Évin line.

### 4.4 La maison
The house in four chapters (la ruelle et la porte, la salle, la terrasse sous les magnolias
[séance photo], la cave et la Chartreuse), Magali et Fabrice by name (no invented biography),
link to Groupes.

### 4.5 Galerie
Editorial grid (mixed 4:5 / 1:1 / 3:2 at the triage crops, no identical cards), filters Salle /
Assiettes / Détails; lightbox: opens from the thumbnail, arrows + Esc + swipe, focus returns to the
thumbnail, captions = alt text.

### 4.6 Réserver
« Envoyer ma demande »: date, service (midi / soir, only open services selectable), couverts (1–7; 8+ →
call or Groupes), nom, téléphone, e-mail (optional), note (terrasse, allergies, occasion). Same-day →
« Appelez-nous ». Success screen: « Demande envoyée. Magali vous confirme par téléphone ou par e-mail
[délai À CONFIRMER]. » Never « réservation confirmée ».

### 4.7 Venir
Address + Itinéraire; static illustrated map of the village centre (church, place, venelle) with a
« Afficher la carte interactive » button that loads OpenStreetMap only after a click; parking sur place;
week table with today highlighted, exceptional closures; phone; e-mail [À CONFIRMER].

### 4.8 Groupes
What is possible (groups, privatisation — capacity [À CONFIRMER]), request form (date, nombre,
occasion, budget optional, contact).

### 4.9 Legal + 404
Mentions légales (LE COMPTOIR SARL, SIREN 750 255 846 [À CONFIRMER], RCS, capital, directeur de
publication, hébergeur), confidentialité (form data retention, no cookies by default), 404 « Cette page
n'est plus à la carte. »

## 5. Motion design (A) — creative but disciplined

Principles: motion tells the visitor something about the house or answers an action; only transform
and opacity; text and hero image visible from the first frame (no loader); heavy libraries loaded
after first interaction or when the section approaches; `prefers-reduced-motion` = static.

| # | Name | Where | What happens | Tech |
|---|---|---|---|---|
| M1 | **L'affiche s'accroche** | hero, on load | the white notice slides 14 px up into the panel and settles from a 0.4° tilt, as if slipped into the clip frame; the four fleurons of the rosette bloom (scale 0.6→1); the salle photo settles from 1.06 to 1 (1.6 s) | CSS + Motion |
| M2 | **Entrer chez Comme Avant** | home, desktop | pinned 4-step story: la ruelle → la porte → la salle → la cave. Each photo is revealed through a door opening (a vertical slit widening from the centre), scrubbed by the scroll; the text changes with a short crossfade; a 1/4…4/4 step marker | GSAP ScrollTrigger (lazy) |
| M2m | same, mobile | home, mobile | no pin; each step's photo opens like a door once when it enters the screen | IntersectionObserver + CSS |
| M3 | **Le mur s'allume** | la cave | the round-headed wine cells light up one after the other like the backlit wall (60 ms stagger, once) | CSS |
| M4 | **La carte vivante** | /carte | sliding underline between chips, list reflow on filter, allergen codes appearing with 30 ms stagger | Motion (layout) |
| M5 | **Statut vivant** | hero + /venir | « Service jusqu'à 14 h (encore 1 h 20) » updates every minute; crossfade when the state changes | client component |
| M6 | **Passer la porte** | page changes | the wordmark stays in place (shared element) while the content crossfades with an 8 px rise (250 ms) | View Transitions API |
| M7 | Micro-interactions | everywhere | press 0.98, underline drawing on links, Rubriques sheet sliding down from the header, booking sheet rising from the sticky bar, lightbox zoom from the thumbnail | Motion |
| M8 | Smooth scroll | desktop only | gentle Lenis on precise pointers; native scroll on touch and reduced motion | Lenis (lazy) |

Before the full build, M1–M3 are prototyped and shown as a live preview link for validation.

## 6. Stack

Next.js 16 (App Router) + TypeScript + Tailwind CSS 4; Motion for UI; GSAP + ScrollTrigger and Lenis
loaded lazily on desktop only; fonts self-hosted with `next/font/local` (Spectral subset with small
caps and tabular figures, Montserrat Medium caps subset); one icon family (Lucide, stroke 1.5);
images via `next/image` (AVIF/WebP, blur placeholders, focal points); no tracking by default.

Editable content without touching code: `content/site.config.ts` (name, address, phone, e-mail,
social, legal), `content/hours.json` (services, closures, holidays, `verifiedThrough`),
`content/menu.json` (carte, prices, allergens, diet tags), `content/wines.json`,
`content/ardoise.json` (today's line, date), `content/reviews.json` (the six Google reviews),
`content/gallery.json` (photos, alt, focal points).

## 7. Open points for the owner

1. Hosting: Vercel Pro (≈ 20 $/month, commercial use allowed) or Netlify / Cloudflare Pages (free tier
   allows commercial use).
2. Which e-mail address receives booking and group requests, and how fast you confirm.
3. Domain registrar of restaurant-comme-avant.com (to point it to the new site without breaking e-mail).
4. Allergens and diet tags per dish (we prefill a draft to correct).
5. Group capacity and privatisation conditions.
