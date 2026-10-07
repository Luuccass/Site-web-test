// The 14 allergens of EU regulation 1169/2011 (annex II), with one pictogram each.
// Pictograms: 24 × 24 grid, 1.5 stroke, round caps and joins, no fill, currentColor. Always decorative
// (aria-hidden): the allergen name is always written next to them.

export type AllergenKey =
  | "gluten"
  | "crustaces"
  | "oeufs"
  | "poissons"
  | "arachides"
  | "soja"
  | "lait"
  | "fruits-a-coque"
  | "celeri"
  | "moutarde"
  | "sesame"
  | "sulfites"
  | "lupin"
  | "mollusques";

export const ALLERGENS: { key: AllergenKey; name: string; detail: string }[] = [
  { key: "gluten", name: "Gluten", detail: "blé, seigle, orge, avoine, épeautre, khorasan" },
  { key: "crustaces", name: "Crustacés", detail: "crevettes, crabes, langoustines…" },
  { key: "oeufs", name: "Œufs", detail: "" },
  { key: "poissons", name: "Poissons", detail: "" },
  { key: "arachides", name: "Arachides", detail: "cacahuètes" },
  { key: "soja", name: "Soja", detail: "" },
  { key: "lait", name: "Lait", detail: "y compris le lactose" },
  { key: "fruits-a-coque", name: "Fruits à coque", detail: "amandes, noisettes, noix, pistaches…" },
  { key: "celeri", name: "Céleri", detail: "" },
  { key: "moutarde", name: "Moutarde", detail: "" },
  { key: "sesame", name: "Sésame", detail: "graines de sésame" },
  { key: "sulfites", name: "Sulfites", detail: "anhydride sulfureux, au-delà de 10 mg/kg ou 10 mg/l" },
  { key: "lupin", name: "Lupin", detail: "" },
  { key: "mollusques", name: "Mollusques", detail: "moules, huîtres, calmars, escargots…" },
];

/** Accepts a key ("fruits-a-coque") or a name ("Fruits à coque") from content/menu.json. */
export function allergenKey(value: string): AllergenKey | null {
  const slug = value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/œ/gi, "oe")
    .toLowerCase()
    .trim()
    .replace(/[^a-z]+/g, "-")
    .replace(/^-|-$/g, "");
  const singular: Record<string, AllergenKey> = {
    oeuf: "oeufs",
    poisson: "poissons",
    crustace: "crustaces",
    arachide: "arachides",
    mollusque: "mollusques",
    "fruit-a-coque": "fruits-a-coque",
    sulfite: "sulfites",
  };
  const found = ALLERGENS.find((a) => a.key === slug);
  return found ? found.key : (singular[slug] ?? null);
}

const PATHS: Record<AllergenKey, React.ReactNode> = {
  // Wheat ear: stem, tip and three pairs of grains.
  gluten: (
    <>
      <path d="M12 21.5V7" />
      <path d="M12 7c-1.4-1.2-1.4-3.6 0-4.8 1.4 1.2 1.4 3.6 0 4.8z" />
      <path d="M12 11c-2.7 0-4.3-1.5-4.3-4.1 2.7 0 4.3 1.5 4.3 4.1z" />
      <path d="M12 11c2.7 0 4.3-1.5 4.3-4.1-2.7 0-4.3 1.5-4.3 4.1z" />
      <path d="M12 15.3c-2.7 0-4.3-1.5-4.3-4.1 2.7 0 4.3 1.5 4.3 4.1z" />
      <path d="M12 15.3c2.7 0 4.3-1.5 4.3-4.1-2.7 0-4.3 1.5-4.3 4.1z" />
      <path d="M12 19.6c-2.7 0-4.3-1.5-4.3-4.1 2.7 0 4.3 1.5 4.3 4.1z" />
      <path d="M12 19.6c2.7 0 4.3-1.5 4.3-4.1-2.7 0-4.3 1.5-4.3 4.1z" />
    </>
  ),
  // Shrimp: curled segmented body, fan tail, antennae.
  crustaces: (
    <>
      <path d="M15.5 4.5C10 4.5 5.5 8.3 5.5 13.3c0 3.4 2.4 5.9 5.6 5.9" />
      <path d="M15.5 9.3c-3.2 0-5.4 2-5.4 4.4 0 1.2.6 2 1.6 2.4" />
      <path d="M15.5 4.5c1.4 0 2.4 1.1 2.4 2.4s-1 2.4-2.4 2.4" />
      <path d="M9.6 6.5l1.6 3.6M6.9 9.8l3.5 1.7M5.6 14.3l4.6-.4" />
      <path d="M11.1 19.2l-2.3 2.3M11.1 19.2l2.9 1.7M11.7 16.1l-.6 3.1" />
      <path d="M17.6 5.8c1.7-.4 2.9-1.6 3.4-3.3M17.9 7.4c1.8.1 3.2-.5 4.1-1.8" />
    </>
  ),
  // Egg with a small highlight.
  oeufs: (
    <>
      <path d="M12 2.8c3.6 0 6.5 5.3 6.5 10.4a6.5 6.5 0 0 1-13 0C5.5 8.1 8.4 2.8 12 2.8z" />
      <path d="M8.6 12.6c.1-1.9.8-3.7 1.9-5" />
    </>
  ),
  // Fish: body, tail, gill and eye.
  poissons: (
    <>
      <path d="M6.6 12c2.2-3.3 5.2-5 8.2-5 2.9 0 5 1.7 6.2 5-1.2 3.3-3.3 5-6.2 5-3 0-6-1.7-8.2-5z" />
      <path d="M6.6 12L2.8 8.6v6.8z" />
      <path d="M13.8 9.3c.8 1.8.8 3.6 0 5.4" />
      <path d="M17.6 11.2h.01" />
    </>
  ),
  // Peanut in its shell.
  arachides: (
    <>
      <path d="M12 2.8c-2.4 0-4.2 1.8-4.2 4.2 0 1.6.8 2.6.8 4.5S7.3 14.4 7.3 16.5c0 2.6 2.1 4.7 4.7 4.7s4.7-2.1 4.7-4.7c0-2.1-1.3-3.1-1.3-5s.8-2.9.8-4.5c0-2.4-1.8-4.2-4.2-4.2z" />
      <path d="M10.4 6.4h.01M13.4 7.6h.01M10.6 16.2h.01M13.5 17.6h.01M12 12h.01" />
    </>
  ),
  // Soybean pod with three beans.
  soja: (
    <>
      <path d="M4.8 19.2c-1.3-1.3-1.1-3.4.4-4.9l9.1-9.1c1.5-1.5 3.6-1.7 4.9-.4s1.1 3.4-.4 4.9l-9.1 9.1c-1.5 1.5-3.6 1.7-4.9.4z" />
      <circle cx="8.3" cy="15.7" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="15.7" cy="8.3" r="1.6" />
      <path d="M19.2 4.8l1.9-1.9" />
    </>
  ),
  // Milk bottle.
  lait: (
    <>
      <path d="M9.5 2.8h5" />
      <path d="M10.2 2.8v3.4L8 9.6v10.6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V9.6l-2.2-3.4V2.8" />
      <path d="M8 13.2h8" />
    </>
  ),
  // Walnut: shell, seam and kernel folds.
  "fruits-a-coque": (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 3.5v17" />
      <path d="M8.6 7.6c1 .7 1 1.9 0 2.6s-1 1.9 0 2.6 1 1.9 0 2.6" />
      <path d="M15.4 7.6c-1 .7-1 1.9 0 2.6s1 1.9 0 2.6-1 1.9 0 2.6" />
    </>
  ),
  // Celery: three stalks with leaves.
  celeri: (
    <>
      <path d="M9.3 21.2l1.3-10.4M12 21.2V9.8M14.7 21.2l-1.3-10.4" />
      <path d="M10.6 10.8C8.4 10.4 6.8 8.6 6.8 6.4c2.2.3 3.8 2.1 3.8 4.4z" />
      <path d="M12 9.8c-1.6-1.5-1.8-3.9-.1-6 1.6 1.5 1.8 3.9.1 6z" />
      <path d="M13.4 10.8c2.2-.4 3.8-2.2 3.8-4.4-2.2.3-3.8 2.1-3.8 4.4z" />
      <path d="M8 21.2h8" />
    </>
  ),
  // Stoneware mustard pot: lid, knob and a band of seeds.
  moutarde: (
    <>
      <path d="M7.4 9.2h9.2l.8 9.1a2.6 2.6 0 0 1-2.6 2.9H9.2a2.6 2.6 0 0 1-2.6-2.9l.8-9.1z" />
      <path d="M8.2 9.2V6.4h7.6v2.8M10.6 6.4V4.2h2.8v2.2" />
      <path d="M7.1 12.6h9.8M6.8 16.8h10.4" />
      <path d="M9.6 14.7h.01M12 14.7h.01M14.4 14.7h.01" />
    </>
  ),
  // Three sesame seeds.
  sesame: (
    <>
      <path d="M7.6 11.4c-1.8-1.7-1.8-4.6 0-6.3 1.8 1.7 1.8 4.6 0 6.3z" transform="rotate(-20 7.6 8.2)" />
      <path d="M16.4 13.4c-1.8-1.7-1.8-4.6 0-6.3 1.8 1.7 1.8 4.6 0 6.3z" transform="rotate(25 16.4 10.2)" />
      <path d="M11 20.6c-1.8-1.7-1.8-4.6 0-6.3 1.8 1.7 1.8 4.6 0 6.3z" transform="rotate(-5 11 17.4)" />
    </>
  ),
  // The formula SO2, drawn with the same stroke.
  sulfites: (
    <>
      <path d="M8.6 8.4c-.4-1.3-1.5-2.1-2.9-2.1-1.6 0-2.8 1-2.8 2.3 0 3.3 6 2 6 5.6 0 1.5-1.3 2.6-3.1 2.6-1.5 0-2.7-.8-3.2-2.1" />
      <ellipse cx="14.2" cy="11" rx="3.4" ry="4.9" />
      <path d="M19.2 15.8c.2-.9.9-1.4 1.6-1.4.9 0 1.5.6 1.5 1.4 0 1.4-3.3 2.4-3.3 3.9h3.4" />
    </>
  ),
  // Lupin flower spike above its palmate leaf.
  lupin: (
    <>
      <path d="M12 21.2V4" />
      <path d="M12 17.4c-2.1.2-3.6-.8-4-2.4 2.1-.2 3.6.8 4 2.4zM12 13.8c2.1.2 3.6-.8 4-2.4-2.1-.2-3.6.8-4 2.4zM12 10.4c-1.8.2-3.1-.7-3.4-2.1 1.8-.2 3.1.7 3.4 2.1zM12 7.2c1.5.1 2.6-.6 2.9-1.8-1.5-.1-2.6.6-2.9 1.8z" />
      <path d="M12 21.2c-1.9-1.2-4-1.4-6.2-.6M12 21.2c1.9-1.2 4-1.4 6.2-.6" />
    </>
  ),
  // Scallop shell (coquille Saint-Jacques) with its ribs and hinge.
  mollusques: (
    <>
      <path d="M12 19.4L3.8 9.6C5.4 5.9 8.4 3.8 12 3.8s6.6 2.1 8.2 5.8z" />
      <path d="M12 19.4L7.6 5.1M12 19.4V3.8M12 19.4l4.4-14.3M12 19.4L4.9 7.6M12 19.4l7.1-11.8" />
      <path d="M9.6 19.4h4.8l-.8 1.8h-3.2z" />
    </>
  ),
};

export function AllergenIcon({ name, className = "h-6 w-6" }: { name: AllergenKey; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      {PATHS[name]}
    </svg>
  );
}
