import Link from "next/link";
import { directionsUrl, site, weekTable } from "@/lib/data";
import { LEGAL_NAV, NAV } from "@/lib/nav";

// The page closes like it opens: the navy sign on the pierre dorée wall, phone number set large.
export function Footer() {
  const open = weekTable.filter((d) => d.midi || d.soir);
  return (
    <footer className="site-footer bg-stone text-ink">
      <div className="mx-auto max-w-[84rem] px-4 py-12 sm:px-8 sm:py-16 lg:px-12">
        <div className="on-navy grid gap-10 bg-navy px-6 py-10 text-on-navy sm:px-10 md:grid-cols-[1.1fr_1fr] md:gap-12 md:px-14 md:py-14">
          <div className="flex flex-col gap-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-comme-avant-stacked.svg" alt="Restaurant Comme Avant, Dardilly" width={678} height={486} className="h-auto w-48 sm:w-56" loading="lazy" />
            <p className="text-on-navy-soft">Réservation au</p>
            <a
              href={`tel:${site.phone.e164}`}
              className="tnum -mt-5 font-light leading-none tracking-[-0.01em] no-underline hover:underline"
              style={{ fontSize: "clamp(2.25rem, calc((100vw - 2rem) / 7.2), 4.5rem)" }}
            >
              {site.phone.display.replace(/ /g, " ")}
            </a>
          </div>
          <div className="grid content-start gap-6">
            <address className="not-italic">
              <span className="block">{site.address.street}</span>
              <span className="block">
                {site.address.postalCode} {site.address.city}
              </span>
              <span className="mt-1 block text-on-navy-soft">{site.parking}</span>
            </address>
            <a href={directionsUrl} className="btn btn-line self-start" rel="noopener">
              Itinéraire
            </a>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-on-navy-soft">
              {open.map((d) => (
                <div key={d.day} className="contents">
                  <dt className="text-on-navy">{d.label}</dt>
                  <dd className="tnum">{[d.midi, d.soir].filter(Boolean).join(" et ")}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <nav aria-label="Plan du site">
            <ul className="flex flex-wrap gap-x-6 gap-y-1">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="inline-flex min-h-11 items-center underline">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/reserver/" className="inline-flex min-h-11 items-center underline">
                  Réserver
                </Link>
              </li>
            </ul>
          </nav>
          <ul className="flex flex-wrap gap-x-6 gap-y-1">
            {LEGAL_NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="inline-flex min-h-11 items-center underline">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a href={site.social.facebook} className="inline-flex min-h-11 items-center underline" rel="noopener">
                Facebook
              </a>
            </li>
          </ul>
        </div>
        <p className="mt-6">
          {site.name}, {site.address.street}, {site.address.postalCode} {site.address.city}, {site.phone.display}
        </p>
      </div>
    </footer>
  );
}
