import { euro, frenchDate, type MenuItem, type MenuSection } from "@/lib/data";
import { ALLERGENS, AllergenIcon, allergenKey } from "./allergens";
import { frenchSpaces, splitDish } from "./typography";

// One section of the carte, set like a printed menu: the dish's first phrase in medium weight, the rest
// of the name (verbatim) in regular, the price on the right in tabular lining figures.

function AllergenLine({ item }: { item: MenuItem }) {
  const keys = item.allergensValidatedAt ? item.allergens.map(allergenKey).filter((k) => k !== null) : [];
  return (
    <div className="allergen-line col-span-2 mt-2 hidden text-[1rem] text-ink-soft group-data-[allergens=on]/carte:block motion-safe:transition-opacity motion-safe:duration-150 starting:opacity-0">
      {item.allergensValidatedAt ? (
        keys.length ? (
          <>
            <p className="sr-only">Allergènes :</p>
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              {ALLERGENS.filter((a) => keys.includes(a.key)).map((a) => (
                <li key={a.key} className="inline-flex items-center gap-1.5">
                  <AllergenIcon name={a.key} className="h-5 w-5" />
                  {a.name}
                </li>
              ))}
            </ul>
            <p className="mt-1 text-[0.9375rem] italic">Allergènes vérifiés le {frenchDate(item.allergensValidatedAt)}</p>
          </>
        ) : (
          <p>
            Aucun des 14 allergènes réglementaires <span className="italic">(vérifié le {frenchDate(item.allergensValidatedAt)})</span>
          </p>
        )
      ) : (
        <p>Allergènes : demandez-nous</p>
      )}
    </div>
  );
}

export function DishRow({ item, withAllergens }: { item: MenuItem; withAllergens: boolean }) {
  const [lead, rest] = splitDish(frenchSpaces(item.name));
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-6 py-2.5 print:break-inside-avoid print:py-[0.7mm]">
      <p>
        <span className="font-medium">{lead}</span>
        {rest}
        {item.detail ? <span className="text-ink-soft">, {item.detail}</span> : null}
      </p>
      <p className="tnum whitespace-nowrap text-right">
        {item.price !== null ? euro(item.price) : <span className="sr-only">prix sur l&apos;ardoise</span>}
      </p>
      {withAllergens ? <AllergenLine item={item} /> : null}
    </li>
  );
}

export function CarteSection({
  section,
  withAllergens,
  children,
}: {
  section: MenuSection;
  withAllergens: boolean;
  children?: React.ReactNode;
}) {
  return (
    <section id={section.id} aria-labelledby={`${section.id}-titre`} className="mt-16 sm:mt-20 print:mt-0 print:break-inside-avoid print:pt-[4mm]">
      <h2 id={`${section.id}-titre`} className="text-[length:var(--text-h2)] print:break-after-avoid print:text-[15pt]">
        {section.title}
      </h2>
      <ul className="mt-4 border-t border-line pt-2 print:mt-[1.5mm] print:pt-[1mm]">
        {section.items.map((item) => (
          <DishRow key={item.id} item={item} withAllergens={withAllergens} />
        ))}
      </ul>
      {children}
    </section>
  );
}
