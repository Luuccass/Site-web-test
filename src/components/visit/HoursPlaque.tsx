import { StatusLines } from "@/components/status/StatusLines";
import { StatusScript } from "@/components/status/StatusScript";
import { appleMapsUrl, directionsUrl, site, weekTable } from "@/lib/data";

// « Horaires et accès »: the address as a street plaque (Montserrat capitals, like the sign) and the
// week with today highlighted (set before paint by the status script: html[data-today]).
export function HoursPlaque({ headingLevel = 2, withAppleMaps = false }: { headingLevel?: 2 | 3; withAppleMaps?: boolean }) {
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <div className="grid gap-12 md:grid-cols-2 md:gap-16">
      <div>
        <H id="horaires-acces" className="text-[length:var(--text-h2)]">
          Horaires et accès
        </H>
        <div className="on-navy mt-8 inline-block bg-navy px-6 py-5 text-on-navy">
          <p className="font-[family-name:var(--font-plaque)] text-[1.0625rem] font-medium uppercase leading-snug tracking-[0.12em]">
            {site.address.street}
            <br />
            {site.address.postalCode} {site.address.city}
          </p>
        </div>
        <p className="mt-6 text-ink-soft">{site.address.access}</p>
        <p className="mt-2">{site.parking}</p>
        <p className="mt-6 flex flex-wrap gap-3">
          <a href={directionsUrl} className="btn btn-solid" rel="noopener">
            Itinéraire
          </a>
          {withAppleMaps ? (
            <a href={appleMapsUrl} className="btn btn-line" rel="noopener">
              Ouvrir dans Plans
            </a>
          ) : null}
          <a href={`tel:${site.phone.e164}`} className="btn btn-line tnum">
            {site.phone.display}
          </a>
        </p>
      </div>
      <div>
        <StatusLines className="flex flex-col" line1ClassName="text-[length:var(--text-h3)]" line2ClassName="text-ink-soft" />
        <table className="week mt-6 w-full border-collapse text-left">
          <caption className="sr-only">Horaires de la semaine</caption>
          <thead>
            <tr className="border-b border-line text-ink-soft">
              <th scope="col" className="py-2 pr-4 font-normal">
                Jour
              </th>
              <th scope="col" className="py-2 pr-4 font-normal">
                Midi
              </th>
              <th scope="col" className="py-2 font-normal">
                Soir
              </th>
            </tr>
          </thead>
          <tbody>
            {weekTable.map((d) => (
              <tr key={d.day} data-day={d.day} className="border-b border-line">
                <th scope="row" className="py-2.5 pr-4 font-medium">
                  {d.label}
                  <span className="today-label"> aujourd&apos;hui</span>
                </th>
                <td className="tnum py-2.5 pr-4">{d.midi ?? "Fermé"}</td>
                <td className="tnum py-2.5">{d.soir ?? "Fermé"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 text-[1rem] text-ink-soft">Jours fériés&nbsp;: appelez-nous pour vérifier.</p>
        <StatusScript />
      </div>
    </div>
  );
}
