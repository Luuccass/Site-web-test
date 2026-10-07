import Link from "next/link";
import { site } from "@/lib/data";

// Groups and private hire: only what the restaurant already states (groups welcome, privatisation
// possible). Capacity, minimum headcount and group menus are not published until confirmed.
export function GroupsNote() {
  return (
    <section aria-labelledby="groupes" className="mx-auto max-w-[84rem] px-4 py-16 sm:px-8 sm:py-24 lg:px-12">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <h2 id="groupes" className="text-[length:var(--text-h2)]">
          Groupes et privatisation
        </h2>
        <div className="measure">
          <p>
            Les groupes sont les bienvenus et le restaurant peut être privatisé. Faites une demande en indiquant la date,
            le nombre de personnes et l&apos;occasion, ou appelez le{" "}
            <a href={`tel:${site.phone.e164}`} className="tnum whitespace-nowrap underline">
              {site.phone.display}
            </a>
            .
          </p>
          <p className="mt-8">
            <Link href="/reserver/#groupes" className="btn btn-solid">
              Demande pour un groupe
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
