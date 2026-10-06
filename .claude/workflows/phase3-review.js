export const meta = {
  name: 'phase3-review',
  description: 'Adversarial review of the Phase 3 architecture/UX/motion plan from three lenses, then synthesis',
  phases: [
    { title: 'Review', detail: 'UX/conversion, motion+perf+a11y, SEO+legal' },
    { title: 'Synthesize', detail: 'decisive revision list' },
  ],
}
const FILES = `Read fully: /home/user/Site-web-test/docs/design/phase3-architecture.md (the plan under review), /home/user/Site-web-test/docs/design/directions.md (direction A is chosen), /home/user/Site-web-test/docs/content/owner-input-2026-10-06.md (real content + owner decisions), /home/user/Site-web-test/docs/research/restaurant-facts.md, /home/user/Site-web-test/docs/research/benchmark.md. The original client brief demands: Next.js App Router + TS + Tailwind, Motion + GSAP/ScrollTrigger + Lenis, Lighthouse ≥ 95 mobile on all 4 categories, LCP < 2.5 s, CLS < 0.1, WCAG 2.2 AA, 60 fps transform/opacity only, prefers-reduced-motion, French-only site, no tracking by default, third-party content only after consent, 14 EU allergens pictograms, PDF + printable carte, JSON-LD Restaurant/Menu/openingHours, sitemap/robots, NAP consistency, mentions légales, sticky mobile bar Réserver/Appeler/Itinéraire, open/closed status in Europe/Paris with holidays and exceptional closures, max 5–6 nav entries, CTA visible without scrolling, ≥ 44 px targets, booking form with confirmation, editable content via JSON/TS files. You may use WebSearch (load via ToolSearch "select:WebSearch") to verify current facts (Next.js 16 view transitions support, GSAP licence, French allergen display rules for restaurants online, Loi Évin rules for wine lists online, CNIL rules for OpenStreetMap/Google Maps embeds, French mentions légales requirements, schema.org Menu). Cap at 10 searches.`
const OUT = { type: 'object', properties: {
  lens: { type: 'string' },
  issues: { type: 'array', items: { type: 'object', properties: { severity: { type: 'string', enum: ['blocker', 'major', 'minor'] }, section: { type: 'string' }, problem: { type: 'string' }, fix: { type: 'string' }, evidence: { type: 'string' } }, required: ['severity', 'section', 'problem', 'fix'] } },
  missing_from_brief: { type: 'array', items: { type: 'string' } },
}, required: ['lens', 'issues', 'missing_from_brief'] }
const LENSES = [
  'UX + conversion + information architecture: test the 10-second mobile journey, nav labels (are « Venir », « La maison », « Rubriques » clear to a French diner?), page count vs value, booking flow friction and honesty, group flow, wireframe order, CTA hierarchy, empty/edge states (closed today, holidays, ardoise not updated, congés), what the owners must maintain.',
  'Motion + performance + accessibility engineer: is each motion (M1–M8) feasible at 60 fps with transform/opacity only (clip-path reveals are NOT transform/opacity — say how to do the door reveal compliantly, e.g. scaleX on a mask element), its effect on LCP/CLS/INP, bundle cost (Motion, GSAP, Lenis), View Transitions support in Next.js 16 and browsers, focus management, reduced-motion fallbacks, WCAG 2.2 AA (focus-not-obscured by sticky bar, target size, dragging alternatives in lightbox), and the Lighthouse ≥ 95 target with these choices.',
  'Local SEO + French legal compliance: JSON-LD shapes, NAP consistency (old « Les Terrasses de Dardilly » listings), Google Business Profile booking link, mentions légales mandatory fields (LCEN), RGPD for the booking form (legal basis, retention, information notice), CNIL rules for map embeds and Google Fonts, allergen information obligations (INCO / décret 2015-447) for an online carte, Loi Évin constraints on the wine page and photos, price display (« prix nets »), accessibility statement obligations for a small business, cookie banner necessity.',
]
phase('Review')
const reviews = (await parallel(LENSES.map((l, i) => () => agent(`${FILES}\n\nLENS: ${l}\nBe severe and concrete; cite evidence for factual/legal claims.`, { label: `review:${['ux', 'motion-a11y', 'seo-legal'][i]}`, phase: 'Review', schema: OUT })))).filter(Boolean)
phase('Synthesize')
const SYN = { type: 'object', properties: {
  revisions: { type: 'array', items: { type: 'object', properties: { section: { type: 'string' }, change: { type: 'string' } }, required: ['section', 'change'] } },
  owner_questions: { type: 'array', items: { type: 'string' } },
  rejected: { type: 'array', items: { type: 'string' } },
}, required: ['revisions', 'owner_questions', 'rejected'] }
const syn = await agent(`${FILES}\n\nYou are the lead. Merge the reviews into a decisive revision list for phase3-architecture.md (only changes you endorse; reject weak ones explicitly with a reason), and the minimal list of questions that only the owners can answer.\n\nREVIEWS:\n${JSON.stringify(reviews, null, 1)}`, { label: 'review:synthesis', phase: 'Synthesize', schema: SYN, effort: 'high' })
return { reviews, syn }
