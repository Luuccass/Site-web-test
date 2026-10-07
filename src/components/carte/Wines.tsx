import { euro, type Wine, wines } from "@/lib/data";
import { frenchSpaces, splitWine } from "./typography";

// The wine list: names verbatim, appellation labels (AOP, AOC, IGP) in small caps, the producer part in
// the secondary colour, prices in tabular lining figures.

const COLOURS: { key: Wine["colour"]; title: string; glassLabel: string }[] = [
  { key: "rouge", title: "Vins rouges", glassLabel: "Rouges" },
  { key: "blanc", title: "Vins blancs", glassLabel: "Blancs" },
  { key: "rose", title: "Vins rosés", glassLabel: "Rosés" },
  { key: "bulles", title: "Les bulles", glassLabel: "Bulles" },
];

function Appellations({ text }: { text: string }) {
  return (
    <>
      {text.split(/\b(AOP|AOC|IGP)\b/).map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="smcp">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

export function WineName({ name: raw }: { name: string }) {
  const [label, producer] = splitWine(frenchSpaces(raw));
  if (!producer) return <Appellations text={label} />;
  return (
    <>
      <Appellations text={label} />
      <span className="text-ink-soft">
        <Appellations text={producer} />
      </span>
    </>
  );
}

const Dash = ({ label }: { label: string }) => (
  <>
    <span aria-hidden="true" className="text-ink-soft">
      –
    </span>
    <span className="sr-only">{label}</span>
  </>
);

/** Au verre ou en pot: one row per wine, one column per volume (12, 25, 46 cl), grouped by colour. */
export function ByGlassTable() {
  const sizes = [...new Set(wines.byGlass.flatMap((w) => w.sizes.map((s) => s.cl)))].sort((a, b) => a - b);
  // Colour groups in the order of the restaurant's list.
  const order = [...new Set(wines.byGlass.map((w) => w.colour))];
  const groups = order.map((key) => ({
    key,
    glassLabel: COLOURS.find((c) => c.key === key)?.glassLabel ?? key,
    rows: wines.byGlass.filter((w) => w.colour === key),
  }));
  return (
    <table className="w-full border-collapse text-left text-[1rem] sm:text-[length:var(--text-body)] print:text-[9.5pt]">
      <caption className="sr-only">Vins au verre ou en pot, prix selon la contenance</caption>
      <thead>
        <tr className="border-b border-ink">
          <th scope="col" className="py-2 pr-3 font-normal text-ink-soft">
            <span className="sr-only">Vin</span>
          </th>
          {sizes.map((cl) => (
            <th key={cl} scope="col" className="tnum w-[3.6rem] whitespace-nowrap py-2 pl-2 text-right font-medium sm:w-[5.5rem]">
              {cl}&nbsp;cl
            </th>
          ))}
        </tr>
      </thead>
      {groups.map((g) => (
        <tbody key={g.key} className="print:break-inside-avoid">
          <tr>
            <th scope="rowgroup" colSpan={sizes.length + 1} className="pb-1 pt-6 font-normal italic text-ink-soft print:pt-[2mm]">
              {g.glassLabel}
            </th>
          </tr>
          {g.rows.map((w) => (
            <tr key={w.name} className="border-b border-line align-baseline">
              <th scope="row" className="py-2.5 pr-3 font-normal print:py-[1mm]">
                <WineName name={w.name} />
              </th>
              {sizes.map((cl) => {
                const size = w.sizes.find((s) => s.cl === cl);
                return (
                  <td key={cl} className="tnum whitespace-nowrap py-2.5 pl-2 text-right print:py-[1mm]">
                    {size ? euro(size.price) : <Dash label={`pas en ${cl} cl`} />}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      ))}
    </table>
  );
}

export function SparklingByGlass() {
  return (
    <ul className="border-t border-ink">
      {wines.sparklingByGlass.map((w) => (
        <li key={w.name} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-6 border-b border-line py-2.5 print:py-[1mm]">
          <p>
            <WineName name={w.name} />
          </p>
          <p className="tnum whitespace-nowrap text-right">{euro(w.price)}</p>
        </li>
      ))}
    </ul>
  );
}

function BottleRow({ wine }: { wine: Wine }) {
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-6 py-2.5 print:break-inside-avoid print:py-[0.5mm]">
      <p>
        <WineName name={wine.name} />
        {wine.format ? <span className="block text-[1rem] italic text-ink-soft print:text-[8.5pt]">{wine.format}</span> : null}
      </p>
      <p className="tnum whitespace-nowrap text-right">{euro(wine.price)}</p>
    </li>
  );
}

function Chevron() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0 motion-safe:transition-transform motion-safe:duration-200 group-open:rotate-180 print:hidden"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

const references = (n: number) => `${n} référence${n > 1 ? "s" : ""}`;

/** Bottles by colour, then by region (native <details>; the very first region is open). */
export function BottleSections() {
  const firstGrouped = COLOURS.find((c) => new Set(wines.bottles.filter((b) => b.colour === c.key).map((b) => b.region)).size > 1);
  const firstRegion = firstGrouped ? wines.bottles.find((b) => b.colour === firstGrouped.key)?.region : undefined;
  return (
    <>
      {COLOURS.map((c) => {
        const list = wines.bottles.filter((b) => b.colour === c.key);
        if (!list.length) return null;
        const regions = new Map<string, Wine[]>();
        for (const b of list) regions.set(b.region, [...(regions.get(b.region) ?? []), b]);
        const id = `bouteilles-${c.key}`;
        return (
          <section key={c.key} id={id} aria-labelledby={`${id}-titre`} className="mt-14 sm:mt-16 print:mt-[5mm]">
            <h3 id={`${id}-titre`} className="text-[length:var(--text-h3)] font-medium print:break-after-avoid print:text-[13pt]">
              {c.title}
            </h3>
            {regions.size === 1 ? (
              <ul className="mt-3 divide-y divide-line border-t border-ink">
                {list.map((w, i) => (
                  <BottleRow key={`${w.name}-${i}`} wine={w} />
                ))}
              </ul>
            ) : (
              <div className="mt-3 border-t border-ink">
                {[...regions.entries()].map(([region, items]) => {
                  const open = c.key === firstGrouped?.key && region === firstRegion;
                  return (
                    <details key={region} open={open} className="group border-b border-line print:[&::details-content]:[content-visibility:visible]">
                      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 print:min-h-0 print:break-after-avoid print:py-[1.2mm] [&::-webkit-details-marker]:hidden">
                        <span className="text-[1.1875rem] print:text-[10.5pt] print:italic">{region}</span>
                        <span className="flex shrink-0 items-center gap-3 whitespace-nowrap text-[1rem] text-ink-soft">
                          <span className="print:hidden">{references(items.length)}</span>
                          <Chevron />
                        </span>
                      </summary>
                      <ul className="divide-y divide-line pb-4 print:pb-[1mm]">
                        {items.map((w, i) => (
                          <BottleRow key={`${w.name}-${i}`} wine={w} />
                        ))}
                      </ul>
                    </details>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </>
  );
}
