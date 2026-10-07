import type { ReactNode } from "react";
import { frenchDate, site } from "@/lib/data";

// Shared frame of the two legal pages (/mentions-legales and /confidentialite): a quiet reading page.
// The section index stays in view on large screens; the facts are set like the carte, one line per
// item with a label on the left, separated by hairline rules.

export type TocEntry = { id: string; label: string };

const container = "mx-auto max-w-[84rem] px-4 sm:px-8 lg:px-12";
const columns = "lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-16 xl:grid-cols-[17rem_minmax(0,1fr)]";

/** French typography for strings typed with plain spaces (content files): U+202F before ; : ! ? and inside « ». */
export function frTypo(text: string): string {
  return text
    .replace(/ ([;:!?])/g, " $1")
    .replace(/« /g, "« ")
    .replace(/ »/g, " »");
}

export function LegalPage({
  title,
  intro,
  updated,
  toc,
  children,
}: {
  title: string;
  intro: ReactNode;
  /** ISO date (YYYY-MM-DD) of the last update of the text. */
  updated: string;
  toc: TocEntry[];
  children: ReactNode;
}) {
  return (
    <div className={container}>
      <header className={`pb-10 pt-12 sm:pb-14 sm:pt-16 ${columns}`}>
        <div className="lg:col-start-2">
          <h1 className="text-[length:var(--text-h1)]">{title}</h1>
          <p className="measure mt-6 text-[1.3125rem] leading-[1.5] sm:text-[1.5rem]">{intro}</p>
          <p className="mt-4 text-ink-soft">
            Mise à jour le <time dateTime={updated}>{frenchDate(updated)}</time>
          </p>
        </div>
      </header>

      <div className={`border-t border-line pb-16 pt-10 sm:pb-24 sm:pt-14 ${columns}`}>
        <nav aria-labelledby="sommaire" className="mb-12 lg:sticky lg:top-[calc(var(--sticky-top)+2rem)] lg:mb-0 lg:self-start">
          <p id="sommaire" className="text-ink-soft">
            Sur cette page
          </p>
          <ul className="mt-1">
            {toc.map((entry) => (
              <li key={entry.id}>
                <a href={`#${entry.id}`} className="link-draw inline-flex min-h-11 items-center">
                  {entry.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="max-w-[46rem]">{children}</div>
      </div>
    </div>
  );
}

export function LegalSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-titre`} className="mt-16 first:mt-0 sm:mt-20">
      <h2 id={`${id}-titre`} className="text-[length:var(--text-h2)]">
        {title}
      </h2>
      <div className="mt-6 space-y-4 [&>p]:max-w-[36em]">{children}</div>
    </section>
  );
}

/** Sub-heading inside a section (h3). */
export function LegalSubheading({ children }: { children: ReactNode }) {
  return <h3 className="pt-4 text-[length:var(--text-h3)] font-medium">{children}</h3>;
}

/** Label / value lines, set like the carte (label left, value right on wide screens). */
export function Facts({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="divide-y divide-line border-y border-line">
      {rows.map((row) => (
        <div key={row.label} className="grid gap-x-8 py-3 sm:grid-cols-[13rem_minmax(0,1fr)]">
          <dt className="text-ink-soft">{row.label}</dt>
          <dd className="[overflow-wrap:anywhere]">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** A plain list with hairline rules (used for credits, data items, processors). */
export function RuledList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="max-w-[36em] divide-y divide-line border-y border-line">
      {items.map((item, i) => (
        <li key={i} className="py-3">
          {item}
        </li>
      ))}
    </ul>
  );
}

/** The restaurant's phone number as an in-text link (never wraps). */
export function ContactPhone() {
  return (
    <a href={`tel:${site.phone.e164}`} className="tnum whitespace-nowrap underline">
      {site.phone.display}
    </a>
  );
}

/** The restaurant's e-mail address as an in-text link (may break anywhere on narrow screens). */
export function ContactEmail() {
  return (
    <a href={`mailto:${site.email}`} className="underline [overflow-wrap:anywhere]">
      {site.email}
    </a>
  );
}
