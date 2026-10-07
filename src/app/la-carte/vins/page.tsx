import type { Metadata } from "next";
import Link from "next/link";
import { DownloadLink } from "@/components/carte/DownloadLink";
import { PrintButton } from "@/components/carte/PrintButton";
import { PrintMasthead } from "@/components/carte/PrintMasthead";
import { BottleSections, ByGlassTable, SparklingByGlass } from "@/components/carte/Wines";
import { WineMenuJsonLd } from "@/components/seo/JsonLd";
import { AlcoholNotice } from "@/components/ui/AlcoholNotice";
import { PageHero } from "@/components/v2/PageHero";
import { frenchDate, wines } from "@/lib/data";

export const metadata: Metadata = {
  title: "Les vins",
  description: `Les vins du Restaurant Comme Avant à Dardilly : au verre, en pot et ${wines.bottles.length} références en bouteille, surtout de la vallée du Rhône et de Bourgogne.`,
  alternates: { canonical: "/la-carte/vins/" },
};

const PDF_HREF = "/pdf/vins-comme-avant.pdf";
const container = "mx-auto max-w-[84rem] px-4 sm:px-8 lg:px-12";
const column = "mx-auto max-w-[50rem]";

function Actions({ className = "" }: { className?: string }) {
  return (
    <div className={`no-print flex flex-wrap gap-3 ${className}`}>
      <DownloadLink href={PDF_HREF} label="Télécharger la carte des vins (PDF)" />
      <PrintButton label="Imprimer la carte des vins" expandDetails />
    </div>
  );
}

export default function VinsPage() {
  return (
    <>
    <div className={`${container} print-only`}>
      <PrintMasthead />
    </div>
    <PageHero
      photo="nuit-salle-mur-vins"
      alt="Mur de bouteilles rétroéclairé en niches arrondies sous les suspensions en rotin"
      focal={[0.5, 0.42]}
      label={`Carte des vins en vigueur au ${frenchDate(wines.updatedAt)}`}
      title={
        <>
          Les <em className="italic text-gold">vins</em>
        </>
      }
      intro={
        <>
          <p>{wines.note} Au verre, en pot ou en bouteille, surtout du Rhône et de Bourgogne.</p>
          <AlcoholNotice className="mt-3 !text-[1rem] text-cream/70" />
        </>
      }
    >
      <Actions className="flex" />
    </PageHero>
    <div className={container}>
      <div className={`${column} pb-20 pt-6 sm:pb-28 print:p-0`}>

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
    </>
  );
}
