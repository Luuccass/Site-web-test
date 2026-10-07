import type { Metadata } from "next";
import Link from "next/link";
import { AllergenLegend } from "@/components/carte/AllergenLegend";
import { AllergenToggle } from "@/components/carte/AllergenToggle";
import { CarteChips } from "@/components/carte/CarteChips";
import { CarteSection } from "@/components/carte/CarteSection";
import { DownloadLink } from "@/components/carte/DownloadLink";
import { PrintButton } from "@/components/carte/PrintButton";
import { PrintMasthead } from "@/components/carte/PrintMasthead";
import { ALLERGEN_NOTE, capitalize } from "@/components/carte/typography";
import { ArdoiseLine } from "@/components/menu/ArdoiseLine";
import { MenuJsonLd } from "@/components/seo/JsonLd";
import { AlcoholNotice } from "@/components/ui/AlcoholNotice";
import { euro, frenchDate, menu, site } from "@/lib/data";

const formulesPrices = menu.formules.items.map((f) => euro(f.price)).join(" et ");

export const metadata: Metadata = {
  title: "La carte",
  description: `La carte du Restaurant Comme Avant à Dardilly : formules du midi à ${formulesPrices}, entrées, plats, fromages et desserts du moment, avec leurs prix.`,
  alternates: { canonical: "/la-carte/" },
};

const PDF_HREF = "/pdf/carte-comme-avant.pdf";
const container = "mx-auto max-w-[84rem] px-4 sm:px-8 lg:px-12";
const column = "mx-auto max-w-[50rem]";

function Actions({ className = "" }: { className?: string }) {
  return (
    <div className={`no-print flex flex-wrap gap-3 ${className}`}>
      <PrintButton label="Imprimer la carte" />
      <DownloadLink href={PDF_HREF} label="Télécharger la carte (PDF)" />
    </div>
  );
}

export default function CartePage() {
  // Per-dish allergens ship only once the kitchen has validated at least one dish.
  const anyValidated = menu.sections.some((s) => s.items.some((i) => i.allergensValidatedAt));
  const chips = [
    { id: "ardoise", label: "Ardoise" },
    { id: "formules", label: "Formules" },
    ...menu.sections.map((s) => ({ id: s.id, label: capitalize(s.title.replace(/^(les?|la|l’|l')\s*/i, "")) })),
  ];

  return (
    <>
      <div className={container}>
        <header className={`${column} pb-10 pt-12 sm:pt-16 print:pb-[4mm] print:pt-0 print:text-center`}>
          <PrintMasthead />
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6 print:justify-center">
            <div>
              <h1 className="text-[length:var(--text-h1)] print:text-[28pt]">La carte</h1>
              <p className="mt-3 text-ink-soft print:mt-[1mm] print:text-[10pt]">Carte en vigueur au {frenchDate(menu.updatedAt)}</p>
            </div>
            <Actions className="hidden lg:flex" />
          </div>
          {anyValidated ? (
            <div className="no-print mt-8">
              <AllergenToggle target="carte" />
            </div>
          ) : null}
        </header>
      </div>

      <CarteChips chips={chips} more={{ href: "/la-carte/vins/", label: "Vins" }} />

      <div className={container}>
        <div id="carte" data-allergens="off" className={`group/carte ${column} print:text-[10pt] print:leading-[1.4]`}>
          {/* In print: the ardoise and the formules side by side, then the dishes in two columns. */}
          <div className="print:grid print:grid-cols-2 print:gap-[8mm]">
          <section
            id="ardoise"
            aria-labelledby="ardoise-titre"
            className="on-navy mt-10 bg-navy px-6 py-7 text-on-navy sm:mt-14 sm:px-9 sm:py-9 print:mt-0 print:break-inside-avoid print:border print:border-ink print:bg-transparent print:px-[5mm] print:py-[3mm] print:text-ink"
          >
            <h2 id="ardoise-titre" className="text-[length:var(--text-h3)] font-normal print:text-[14pt]">
              L&apos;ardoise
            </h2>
            <ArdoiseLine className="mt-2 text-[1.1875rem] leading-snug print:text-[11pt]" />
            <p className="mt-3 text-[1rem] text-on-navy-soft print:text-[9.5pt] print:text-ink-soft">Allergènes : demandez-nous.</p>
          </section>

          <section
            id="formules"
            aria-labelledby="formules-titre"
            className="mt-10 border border-navy px-6 py-7 sm:mt-12 sm:px-9 sm:py-8 print:mt-0 print:break-inside-avoid print:px-[5mm] print:py-[3mm]"
          >
            <h2 id="formules-titre" className="text-[length:var(--text-h3)] font-normal print:text-[14pt]">
              Formules du midi
            </h2>
            <p className="mt-1 text-ink-soft print:text-[10pt]">{capitalize(menu.formules.when)}.</p>
            <ul className="mt-4 grid gap-4 print:mt-[2mm] print:gap-[2mm]">
              {menu.formules.items.map((f) => (
                <li key={f.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6">
                  <p>
                    <span className="font-medium">{f.label}</span>
                    <span className="block text-ink-soft print:text-[10pt]">{f.detail}</span>
                  </p>
                  <p className="tnum text-[length:var(--text-h3)] print:text-[13pt]">{euro(f.price)}</p>
                </li>
              ))}
            </ul>
          </section>

          </div>

          <div className="print:mt-[1mm] print:columns-2 print:gap-[10mm]">
            {menu.sections.map((section) => (
              <CarteSection key={section.id} section={section} withAllergens={anyValidated}>
                {section.items.some((i) => i.alcohol) ? <AlcoholNotice className="mt-5 text-ink-soft print:mt-[2mm] print:text-[9pt]" /> : null}
              </CarteSection>
            ))}
          </div>
        </div>

        <div className={`${column} pb-20 pt-16 sm:pb-28 sm:pt-20 print:pb-0 print:pt-[3mm]`}>
          <section aria-labelledby="allergenes-titre" className="print:break-inside-avoid">
            <h2 id="allergenes-titre" className="text-[length:var(--text-h3)] font-normal print:hidden">
              Allergènes
            </h2>
            <p className="measure mt-3 print:mt-0 print:max-w-none print:text-[9.5pt]">{ALLERGEN_NOTE}</p>
            <p className="no-print mt-2">
              <a href={`tel:${site.phone.e164}`} className="tnum inline-flex min-h-11 items-center underline">
                {site.phone.display}
              </a>
            </p>
            <AllergenLegend className="mt-6" />
          </section>

          <div className="mt-10 grid gap-1 text-ink-soft print:mt-[1mm] print:text-[9.5pt]">
            <p>{menu.pricesNote}</p>
          </div>

          <Actions className="mt-8 lg:hidden" />

          <div className="no-print mt-12 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-line pt-10">
            <Link href="/reserver/" className="btn btn-solid">
              Réserver une table
            </Link>
            <Link href="/la-carte/vins/" className="link-draw inline-flex min-h-11 items-center">
              Les vins
            </Link>
          </div>
        </div>
      </div>
      <MenuJsonLd />
    </>
  );
}
