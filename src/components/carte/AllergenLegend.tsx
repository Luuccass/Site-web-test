import { ALLERGENS, AllergenIcon } from "./allergens";

// Legend of the 14 regulated allergens, folded in a native <details> (works without JavaScript).
export function AllergenLegend({ className = "" }: { className?: string }) {
  return (
    <details className={`group border-y border-line print:hidden ${className}`}>
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-2 font-medium [&::-webkit-details-marker]:hidden">
        Les 14 allergènes réglementaires
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5 shrink-0 motion-safe:transition-transform motion-safe:duration-200 group-open:rotate-180"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </summary>
      <ul className="grid gap-x-8 gap-y-4 pb-6 pt-3 sm:grid-cols-2">
        {ALLERGENS.map((a) => (
          <li key={a.key} className="grid grid-cols-[2rem_minmax(0,1fr)] items-start gap-x-3">
            <AllergenIcon name={a.key} className="mt-0.5 h-7 w-7" />
            <span>
              {a.name}
              {a.detail ? <span className="block text-[1rem] leading-snug text-ink-soft">{a.detail}</span> : null}
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}
