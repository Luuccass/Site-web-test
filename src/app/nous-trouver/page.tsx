import type { Metadata } from "next";
import Link from "next/link";
import { nobreak } from "@/components/booking/copy";
import { weekdaysPhrase } from "@/components/booking/schedule";
import { RestaurantJsonLd } from "@/components/seo/JsonLd";
import { HoursPlaque } from "@/components/visit/HoursPlaque";
import { MapClickToLoad } from "@/components/visit/MapClickToLoad";
import { frenchDate, hours, site } from "@/lib/data";

const description = `Horaires et accès du Restaurant Comme Avant à Dardilly : le midi ${weekdaysPhrase(hours.services, "midi")}, le soir ${weekdaysPhrase(hours.services, "soir")}. Adresse, parking, itinéraire, contact.`;

export const metadata: Metadata = {
  title: "Horaires et accès",
  description,
  alternates: { canonical: "/nous-trouver/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Restaurant Comme Avant, Dardilly",
    url: "/nous-trouver/",
    title: "Horaires et accès | Restaurant Comme Avant, Dardilly",
    description,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "La salle du restaurant Comme Avant à Dardilly" }],
  },
};

// Position of the door for the OpenStreetMap embed. Left empty on purpose: it could not be checked to
// within a few metres, and a marker on the wrong lane is worse than none. While it is null, the map
// panel links to the OpenStreetMap search for the address instead. Set it (e.g. { lat: 45.8…, lon: 4.7… })
// once the position is confirmed on openstreetmap.org.
const MAP_POINT: { lat: number; lon: number } | null = null;

const container = "mx-auto max-w-[84rem] px-4 sm:px-8 lg:px-12";
const address = `${site.address.street}, ${site.address.postalCode} ${site.address.city}`;

const CLOSURE_LABEL = {
  conges: "Congés",
  fermeture: "Fermeture exceptionnelle",
  privatisation: "Privatisation, restaurant fermé",
} as const;

export default function NousTrouverPage() {
  // Closures still to come at build time (every edit of hours.json rebuilds the site).
  const today = new Date().toISOString().slice(0, 10);
  const closures = hours.closures.filter((c) => c.to >= today).sort((a, b) => a.from.localeCompare(b.from));

  return (
    <>
      <div className={container}>
        <header className="pb-10 pt-12 sm:pb-14 sm:pt-16">
          <h1 className="text-[length:var(--text-h1)]">Horaires et accès</h1>
        </header>
        {/* The page title already says « Horaires et accès »: the plaque's own heading is hidden here. */}
        <section aria-label="Adresse et horaires" className="pb-16 sm:pb-24">
          <HoursPlaque withAppleMaps showHeading={false} />
          {closures.length ? (
            <div className="mt-12 md:ml-[calc(50%+2rem)]">
              <h2 className="text-[length:var(--text-h3)] font-normal">Fermetures exceptionnelles</h2>
              <ul className="mt-4 space-y-2">
                {closures.map((c) => (
                  <li key={`${c.from}-${c.kind}`}>
                    {CLOSURE_LABEL[c.kind]}
                    {c.services ? ` (${c.services.join(" et ")})` : ""}{" "}
                    {c.from === c.to ? `le ${frenchDate(c.from)}` : `du ${frenchDate(c.from)} au ${frenchDate(c.to)}`}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      </div>

      <div className="border-t border-line">
        <div className={`${container} grid gap-16 py-16 sm:py-24 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-20`}>
          <section aria-labelledby="plan-titre">
            <h2 id="plan-titre" className="text-[length:var(--text-h2)]">
              Plan
            </h2>
            <div className="mt-8">
              <MapClickToLoad
                point={MAP_POINT}
                query={address}
                title={`Carte OpenStreetMap\u202f: ${site.name}, ${address}`}
                street={site.address.street}
                locality={`${site.address.postalCode} ${site.address.city}`}
              />
            </div>
          </section>

          <section id="contact" aria-labelledby="contact-titre">
            <h2 id="contact-titre" className="text-[length:var(--text-h2)]">
              Contact
            </h2>
            <dl className="mt-8 grid gap-7">
              <div>
                <dt className="text-ink-soft">Téléphone</dt>
                <dd className="mt-1">
                  <a
                    href={`tel:${site.phone.e164}`}
                    className="tnum inline-block text-[length:var(--text-h2)] font-light leading-tight no-underline hover:underline"
                  >
                    {nobreak(site.phone.display)}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-ink-soft">E-mail</dt>
                <dd className="mt-1">
                  <a href={`mailto:${site.email}`} className="underline [overflow-wrap:anywhere]">
                    {site.email}
                  </a>
                </dd>
              </div>
              {site.social.facebook ? (
                <div>
                  <dt className="text-ink-soft">Facebook</dt>
                  <dd className="mt-1">
                    <a href={site.social.facebook} className="underline" rel="noopener">
                      {site.name} sur Facebook
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
            <p className="mt-10">
              <Link href="/reserver/" className="btn btn-solid">
                Réserver une table
              </Link>
            </p>
          </section>
        </div>
      </div>
      <RestaurantJsonLd />
    </>
  );
}
