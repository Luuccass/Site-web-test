import type { Metadata } from "next";
import { BookingForm } from "@/components/booking/BookingForm";
import { nobreak } from "@/components/booking/copy";
import { fieldId } from "@/components/booking/fields";
import { InlineScript } from "@/components/status/InlineScript";
import { hours, hoursSentence, site } from "@/lib/data";

const description =
  "Demande de réservation au Restaurant Comme Avant à Dardilly\u202f: date, service, heure et nombre de personnes. Le restaurant vous confirme la table.";

export const metadata: Metadata = {
  title: "Réserver une table",
  description,
  alternates: { canonical: "/reserver/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Restaurant Comme Avant, Dardilly",
    url: "/reserver/",
    title: "Réserver une table | Restaurant Comme Avant, Dardilly",
    description,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "La salle du restaurant Comme Avant à Dardilly" }],
  },
};

// Party sizes the form accepts; beyond, the error message sends the visitor to the phone.
const MAX_COVERS = 20;

export default function ReserverPage() {
  const { booking } = hours;
  const tel = `tel:${site.phone.e164}`;
  return (
    <div className="mx-auto max-w-[84rem] px-4 pb-16 sm:px-8 sm:pb-24 lg:px-12">
      <header className="max-w-[50rem] pb-10 pt-12 sm:pb-14 sm:pt-16">
        <h1 className="text-[length:var(--text-h1)]">Réserver une table</h1>
        <p className="measure mt-6 text-[1.3125rem] leading-[1.5] sm:text-[1.5rem]">
          Envoyez votre demande&#8239;: le restaurant vous confirme la table par téléphone ou par e-mail.
        </p>
        <p className="measure mt-4">
          Pour une table aujourd&apos;hui, le plus rapide est d&apos;appeler le{" "}
          <a href={tel} className="tnum underline">
            {nobreak(site.phone.display)}
          </a>
          .
        </p>
      </header>

      <div className="grid gap-16 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:gap-20">
        <div className="max-w-[46rem]">
          {/* Collapses the no-JS-only parts before the first paint when JavaScript runs (no layout shift). */}
          <InlineScript html="document.documentElement.classList.add('js-booking')" />
          <BookingForm
            formName={site.booking.formName}
            calendar={{
              services: hours.services,
              closures: hours.closures,
              publicHolidays: hours.publicHolidays,
              horizonDays: booking.horizonDays,
              slotMinutes: booking.slotMinutes,
            }}
            leadMinutes={booking.sameDayLeadMinutes}
            groupThreshold={booking.groupThreshold}
            maxCovers={MAX_COVERS}
            phone={site.phone}
          />
        </div>

        <aside className="grid content-start gap-12 lg:sticky lg:top-[calc(var(--sticky-top)+2rem)] lg:self-start">
          <section aria-labelledby="par-telephone" className="on-navy bg-navy px-6 py-8 text-on-navy sm:px-8">
            <h2 id="par-telephone" className="text-[length:var(--text-h3)] font-normal">
              Par téléphone
            </h2>
            <p className="mt-3">
              <a
                href={tel}
                className="tnum inline-block text-[length:var(--text-h2)] font-light leading-tight no-underline hover:underline"
              >
                {nobreak(site.phone.display)}
              </a>
            </p>
            <p className="mt-4 text-[1rem] text-on-navy-soft">{hoursSentence}</p>
          </section>

          <section id="groupes" aria-labelledby="groupes-titre">
            <h2 id="groupes-titre" className="text-[length:var(--text-h3)] font-normal">
              Groupes et privatisation
            </h2>
            <p className="mt-3">
              Les groupes sont les bienvenus et le restaurant peut être privatisé. Indiquez le nombre de personnes dans le
              formulaire&#8239;: à partir de {booking.groupThreshold}, il vous demande l&apos;occasion, si vous souhaitez privatiser et
              votre budget. Vous pouvez aussi appeler le{" "}
              <a href={tel} className="tnum underline">
                {nobreak(site.phone.display)}
              </a>
              .
            </p>
            <p className="mt-4">
              <a href={`#${fieldId("couverts")}`} className="link-draw">
                Indiquer le nombre de personnes
              </a>
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
