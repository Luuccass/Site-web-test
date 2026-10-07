"use client";

import { useEffect, useState } from "react";

// « Afficher les allergènes »: a toggle button (aria-pressed, constant label). It flips
// data-allergens on the carte wrapper; CSS shows the per-dish lines, fading in as one block (M4).
// Rendered only when at least one dish has allergens validated by the kitchen.
export function AllergenToggle({ target }: { target: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    document.getElementById(target)?.setAttribute("data-allergens", on ? "on" : "off");
  }, [on, target]);
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => setOn((v) => !v)}
      className="btn btn-line no-print aria-pressed:bg-navy aria-pressed:text-on-navy"
    >
      <span aria-hidden="true" className="grid h-4 w-4 place-items-center rounded-[2px] border border-current">
        {on ? (
          <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3.5 8.5l3 3 6-7" />
          </svg>
        ) : null}
      </span>
      Afficher les allergènes
    </button>
  );
}
