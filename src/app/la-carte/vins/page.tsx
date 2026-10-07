import type { Metadata } from "next";
import Link from "next/link";
import { DownloadLink } from "@/components/carte/DownloadLink";
import { PrintButton } from "@/components/carte/PrintButton";
import { PrintMasthead } from "@/components/carte/PrintMasthead";
import { BottleSections, ByGlassTable, SparklingByGlass } from "@/components/carte/Wines";
import { WineMenuJsonLd } from "@/components/seo/JsonLd";
import { AlcoholNotice } from "@/components/ui/AlcoholNotice";
import { frenchDate, wines } from "@/lib/data";

export const metadata: Metadata = {
  title: "Les vins",
  description: `Les vins du Restaurant Comme Avant à Dardilly : au verre, en pot et ${wines.bottles.length} références en bouteille, surtout de la vallée du Rhône et de Bourgogne.`,
  alternates: { canonical: "/la-carte/vins/" },
};

const PDF_HREF = "/pdf/vins-comme-avant.pdf";
const container = "mx-auto max-w-[84rem] px-4 sm:px-8 lg:px-12";
const column = "mx-auto max-w-[50rem]";

function Actions({ className = "" }: { className?: string }) {
  return (
    <div className={`no-print flex flex-wrap gap-3 ${className}`}>
      <DownloadLink href={PDF_HREF} label="Télécharger la carte des vins (PDF)" />
      <PrintButton label="Imprimer" expandDetails />
    </div>
  );
}

export default function VinsPage() {
  return (
    <div className={container}>
      <div className={`${column} pb-20 pt-12 sm:pb-28 sm:pt-16 print:p-0`}>
        <header className="print:text-center">
          <PrintMasthead />
          <h1 className="text-[length:var(--text-h1)] print:text-[30pt]">Les vins</h1>
          <p className="mt-4 text-[1.1875rem] print:mt-[1mm] print:text-[10.5pt]">{wines.note}</p>
          <p className="mt-1 text-ink-soft print:text-[9.5pt]">Carte des vins en vigueur au {frenchDate(wines.updatedAt)}</p>
          <AlcoholNotice className="mt-4 text-ink-soft print:mt-[1mm] print:text-[9pt]" />
          <Actions className="mt-8" />
        </header>

        <section aria-labelledby="au-verre" className="mt-14 sm:mt-20 print:mt-[6mm]">
          <h2 id="au-verre" className="text-[length:var(--text-h2)] print:text-[17pt]">
            Au verre ou en pot
          </h2>
          <div className="mt-5 print:mt-[2mm]">
            <ByGlassTable />
          </div>
          <h3 className="mt-10 text-[length:var(--text-h3)] font-medium print:mt-[4mm] print:text-[13pt]">À la coupe</h3>
          <div className="mt-3">
            <SparklingByGlass />
          </div>
        </section>

        <section aria-labelledby="en-bouteille" className="mt-16 sm:mt-24 print:mt-[6mm]">
          <h2 id="en-bouteille" className="text-[length:var(--text-h2)] print:text-[17pt]">
            En bouteille
          </h2>
          <p className="mt-3 text-ink-soft print:hidden">Par couleur, puis par région.</p>
          <div className="print:columns-2 print:gap-[8mm] print:text-[9pt] print:leading-[1.35]">
            <BottleSections />
          </div>
        </section>

        <footer className="mt-16 border-t border-line pt-10 print:mt-[5mm] print:border-0 print:pt-0">
          <p>{wines.note}</p>
          <AlcoholNotice className="mt-2 print:text-[9pt]" />
          <Actions className="mt-8" />
          <p className="no-print mt-10">
            <Link href="/la-carte/" className="link-draw inline-flex min-h-11 items-center">
              Retour à la carte
            </Link>
          </p>
        </footer>
      </div>
      <WineMenuJsonLd />
    </div>
  );
}
