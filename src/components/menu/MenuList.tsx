import { euro, type MenuSection } from "@/lib/data";

// One section of the carte: dish name on the left, price on the right in tabular figures.
export function MenuList({
  section,
  headingLevel = 2,
  className = "",
  showAllergens = false,
}: {
  section: MenuSection;
  headingLevel?: 2 | 3;
  className?: string;
  showAllergens?: boolean;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <div className={className}>
      <Heading id={`section-${section.id}`} className={headingLevel === 2 ? "text-[length:var(--text-h2)]" : "text-[length:var(--text-h3)] font-medium"}>
        {section.title}
      </Heading>
      <ul className="mt-4 divide-y divide-line">
        {section.items.map((item) => (
          <li key={item.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-6 py-3">
            <span>
              {item.name}
              {item.detail ? <span className="text-ink-soft">, {item.detail}</span> : null}
            </span>
            <span className="tnum text-right">{item.price !== null ? euro(item.price) : <span className="sr-only">prix selon l&apos;ardoise</span>}</span>
            {showAllergens ? (
              <span className="col-span-2 mt-1 text-[1rem] text-ink-soft">
                {item.allergensValidatedAt && item.allergens.length
                  ? `Allergènes : ${item.allergens.join(", ")}`
                  : item.askAllergens
                    ? "Allergènes : demandez-nous"
                    : null}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
