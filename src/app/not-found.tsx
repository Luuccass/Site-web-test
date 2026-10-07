import type { Metadata } from "next";
import Link from "next/link";
import { Photo } from "@/components/media/Photo";
import { StatusScript } from "@/components/status/StatusScript";
import { menu, site } from "@/lib/data";

// 404: the sign at the door again (pierre dorée frame, navy panel, white notice pinned on it, as in the
// home hero), with the main pages set like lines of the carte: name on the left, what you find there on
// the right. Next.js adds `<meta name="robots" content="noindex">` to this page by itself.

export const metadata: Metadata = {
  title: "Page introuvable",
  description: "Cette adresse n'existe pas ou plus sur le site du Restaurant Comme Avant à Dardilly.",
  // Do not inherit the root layout's canonical ("/"): a missing page has no canonical URL.
  alternates: { canonical: null },
};

// « Formules du midi, entrées, plats, fromages, desserts », from menu.json.
const carteContents = [
  "Formules du midi",
  ...menu.sections.map((s) => s.title.replace(/^(les?|la|l’|l')\s*/i, "").toLowerCase()),
].join(", ");

const PAGES = [
  { href: "/", label: "Accueil", detail: null },
  { href: "/la-carte/", label: "La carte", detail: carteContents },
  { href: "/nous-trouver/", label: "Horaires et accès", detail: `${site.address.street}, ${site.address.city}` },
] as const;

export default function NotFound() {
  return (
    <section aria-labelledby="introuvable-titre" className="v2-grain relative flex min-h-[100svh] items-end overflow-hidden">
      <div className="absolute inset-0">
        <Photo id="nuit-exterieur-ruelle" alt="" sizes="100vw" focal={[0.5, 0.4]} className="!absolute inset-0 h-full !aspect-auto" />
      </div>
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,16,32,0.75)_0%,rgba(11,16,32,0.55)_40%,rgba(11,16,32,0.96)_80%)]" />
      <div className="relative z-[3] mx-auto w-full max-w-[96rem] px-5 pb-14 pt-32 sm:px-10">
        <div className="max-w-[44rem]">
          <p className="v2-label">Erreur 404</p>
          <h1 id="introuvable-titre" className="v2-display mt-5 text-[clamp(3.2rem,9vw,7.5rem)] !leading-[0.95]">
            Cette page n&apos;est plus <em className="italic text-gold">à la carte</em>.
          </h1>
          <p className="mt-6 text-ink-soft">
            Le lien que vous avez suivi est peut-être ancien, ou l&apos;adresse a été mal recopiée.
          </p>

          <nav aria-label="Pages principales" className="mt-6">
            <ul className="divide-y divide-line border-y border-line">
              {PAGES.map((page) => (
                <li key={page.href}>
                  <Link
                    href={page.href}
                    className="group flex min-h-12 flex-wrap items-baseline justify-between gap-x-6 gap-y-0.5 py-3 no-underline"
                  >
                    <span className="link-draw text-[1.25rem] group-hover:[background-size:100%_1px] group-focus-visible:[background-size:100%_1px]">
                      {page.label}
                    </span>
                    {page.detail ? (
                      <span className="text-[1rem] text-ink-soft">
                        {/* Pause between the page name and its detail for screen readers. */}
                        <span className="sr-only">, </span>
                        {page.detail}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="cta-row mt-6 flex flex-wrap gap-2.5">
            <Link href="/reserver/" className="cta-book btn btn-solid flex-[1_1_11rem]">
              Réserver une table
            </Link>
            <a href={`tel:${site.phone.e164}`} className="cta-call btn btn-line flex-[1_1_11rem]">
              <span data-call-label suppressHydrationWarning>
                Appeler
              </span>
            </a>
          </div>
          {/* Same order rule as the hero: « Appeler » first while a service is still possible today. */}
          <StatusScript />
        </div>
      </div>
    </section>
  );
}
