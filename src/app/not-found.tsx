import type { Metadata } from "next";
import Link from "next/link";
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
    <section
      aria-labelledby="introuvable-titre"
      className="bg-stone p-2.5 sm:p-6 lg:flex lg:min-h-[calc(100svh-4.25rem)] lg:items-center lg:justify-center lg:p-12 xl:p-16"
    >
      <div className="mx-auto w-full max-w-[38rem] bg-navy px-4 pb-4 pt-6 text-on-navy sm:px-8 sm:pb-8 sm:pt-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/logo-comme-avant-stacked.svg"
          alt=""
          width={678}
          height={486}
          className="mx-auto h-auto w-[8.5rem] sm:w-[11rem]"
        />
        <div className="m1-notice mt-6 bg-paper px-4 py-6 text-ink sm:mt-9 sm:px-8 sm:py-8">
          <h1 id="introuvable-titre" className="text-[length:var(--text-display)] leading-[1.05]">
            Cette page n&apos;est plus à la carte.
          </h1>
          <p className="mt-4 text-ink-soft">
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
