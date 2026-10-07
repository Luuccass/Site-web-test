# Phase 5 — QA report (7 October 2026)

All measurements on the static export served by `scripts/qa/serve-h2.mjs` (HTTP/2 + Brotli, like
Netlify's CDN). Re-run everything with the commands in the README.

## Lighthouse 13, mobile preset (simulated slow 4G, 4× CPU)

| Page | Perf. | Access. | Best pr. | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| `/` | 97 | 100 | 100 | 100 | 2.6 s | 0 | 40 ms |
| `/la-carte/` | 100 | 100 | 100 | 100 | 1.5 s | 0 | 80 ms |
| `/la-carte/vins/` | 99 | 100 | 100 | 100 | 2.0 s | 0 | 50 ms |
| `/le-restaurant/` | 100 | 100 | 100 | 100 | 1.9 s | 0 | 40 ms |
| `/galerie/` | 96 | 100 | 100 | 100 | 2.7 s | 0 | 60 ms |
| `/nous-trouver/` | 100 | 100 | 100 | 100 | 1.8 s | 0 | 40 ms |
| `/reserver/` | 100 | 100 | 100 | 100 | 1.7 s | 0 | 50 ms |
| `/mentions-legales/` | 99 | 100 | 100 | 100 | 1.7 s | 0 | 90 ms |
| `/confidentialite/` | 99 | 100 | 100 | 100 | 1.7 s | 0 | 90 ms |

All nine pages are at 95 or more in the four categories. After the last visual fixes, /galerie/ was
re-measured at 98 (LCP 2.3 s) and /mentions-legales/ at 99. Note: over `npx serve` (HTTP/1.1, gzip)
the home page scores 82–93: the gap is the local server, not the site.

## Accessibility

- axe-core (WCAG 2.0/2.1/2.2 A and AA rules) at 390 px on the 10 pages, including the 404:
  **0 violations**. One run flagged `target-size` on two contents links of /mentions-legales/ while
  the mobile bar was moving; it does not reproduce at rest or scrolled (checked twice).
- Keyboard: « Aller au contenu » is the first stop and moves focus to `main`; logical order on desktop
  and mobile; every focus stop has a visible outline; the mobile bar is `inert` while hidden.
- Lightbox: opens from a button, arrows/Home/End/Esc, focus returns to the thumbnail.
- « Plus » sheet: native modal dialog, closes on navigation, focus lands on the new page's h1.
- Reduced motion: doors open and cave lit immediately, no page transition.
- Text zoom 200 %: the call to action stays reachable (mobile bar).

## Layout

Full-page screenshots of the 10 pages at 360, 390, 768, 1024, 1440 and 1920 px, plus viewport
screenshots for the art-director review (`scripts/qa/viewports.mjs`): **no horizontal overflow** at any
width.

## Behaviour (`scripts/qa/interactions.mjs`, 18/18)

- Booking: the date becomes a list of the next open days (no Sunday/Monday); empty submit focuses
  the error summary; evening slots 19:30–21:15; the Netlify payload carries `form-name`, date,
  service, time, party size and a readable subject; the success panel says « pas encore confirmée »
  and takes focus.
- Same-day rule (Thursday 18:45): 19:30 is refused online and the phone is offered; 20:00 is sent,
  flagged `jour-meme=oui`, subject starting « AUJOURD'HUI — ».
- No-JS: the form exists in the static HTML with every field Netlify needs.
- Navigation with the M6 page transition: no console error.

## Privacy

No request to any third-party host on any page, no cookie, no storage. OpenStreetMap only opens
after a click (and in a new tab while the exact coordinates are not verified).

## Structured data

`Restaurant` (address, phone, e-mail, opening hours, menu and booking URLs, price range, cuisine,
Facebook) on the home page; `Menu` with sections and priced items on /la-carte/ and /la-carte/vins/.
No `aggregateRating` (Google does not accept self-published ratings for a local business).

## Art-director fixes made during QA

- Footer hours and phone number no longer overflow at 360 px; week table tightened on phones.
- Standalone links in the content show a faint underline at rest (they read as plain text before).
- Galerie: the wide sign leads its row so phones show it full width over two portraits.
- Home sign: « Fermé ce soir » no longer wraps at 1024 px.
- PDFs are byte-identical when the content has not changed.
