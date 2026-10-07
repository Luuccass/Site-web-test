import Link from "next/link";
import { AlcoholNotice } from "@/components/ui/AlcoholNotice";
import { euro, wines } from "@/lib/data";

// La cave: round-headed cells mirroring the backlit wine wall of the dining room.
// M3 « Le mur s'allume »: the cells light up one after another when the wall enters the screen.
const PICKS: { region: string; names: string[] }[] = [
  { region: "Vallée du Rhône", names: ["Saint-Joseph « Les Challeys »", "Crozes-Hermitage « Les Meysonniers »", "AOP Côte-Rôtie « Fortis »"] },
  { region: "Bourgogne", names: ["Givry 2024", "Mercurey 2023", "AOC Pouilly-Fuissé 2023"] },
  { region: "Beaujolais", names: ["Chiroubles « La scandaleuse »", "Morgon 2025", "Moulin-à-Vent"] },
];

function split(name: string) {
  // "Appellation « Cuvée » 2024 – Domaine" -> appellation, rest
  const [label, ...producer] = name.split(" – ");
  return { label: label.replace(/^(AOP|AOC|IGP) /, ""), producer: producer.join(" – ") };
}

export function CaveWall() {
  const count = wines.bottles.length;
  let index = 0;
  return (
    <section aria-labelledby="cave" className="on-navy bg-navy text-on-navy">
      <div className="mx-auto max-w-[84rem] px-4 pb-20 sm:px-8 sm:pb-28 lg:px-12">
        <div className="border-t border-line-navy/50 pt-16 sm:pt-24">
          <h2 id="cave" className="text-[length:var(--text-h2)]">
            La cave
          </h2>
          <p className="measure mt-5 text-on-navy-soft">
            {count} références en bouteille, surtout de la vallée du Rhône et de Bourgogne, et des vins au verre ou en pot. Quelques bouteilles de la carte&nbsp;:
          </p>
        </div>
        <ul className="wall mx-auto mt-10 grid max-w-[60rem] grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {PICKS.flatMap((group) =>
            group.names.map((n) => {
              const wine = wines.bottles.find((b) => b.name.includes(n));
              if (!wine) return null;
              const { label, producer } = split(wine.name);
              const delay = `${index++ * 60}ms`;
              return (
                <li
                  key={wine.name}
                  className="cell flex flex-col rounded-t-[999px] border border-line-navy/60 bg-navy-raised px-3 pb-4 pt-12 text-center sm:px-5 sm:pt-16"
                  style={{ ["--cell-delay" as string]: delay }}
                >
                  <span className="smcp text-[0.9375rem] text-on-navy-soft">{group.region}</span>
                  <span className="mt-2 block text-[1.0625rem] font-medium leading-snug">{label}</span>
                  <span className="mt-1 block text-[0.9375rem] leading-snug text-on-navy-soft">{producer}</span>
                  <span className="tnum mt-auto block pt-3">{euro(wine.price)}</span>
                </li>
              );
            }),
          )}
        </ul>
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Link href="/la-carte/vins/" className="btn btn-line">
            Tous les vins
          </Link>
          <AlcoholNotice className="text-on-navy-soft" />
        </div>
      </div>
    </section>
  );
}
