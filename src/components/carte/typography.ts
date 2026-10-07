// Shared by the carte pages and the PDF script (scripts/pdf/build-pdf.tsx): plain TypeScript, no JSX.

/** Fixed allergen wording (French allergen information rules); U+202F before « ? ». */
export const ALLERGEN_NOTE =
  "Le tableau des 14\u00A0allergènes de chaque plat est consultable librement au restaurant. Une allergie\u202F? Signalez-la par téléphone ou à votre arrivée. Cuisine non exempte de traces.";

/** Same wording as components/ui/AlcoholNotice (Loi Évin). */
export const ALCOHOL_NOTICE = "L'abus d'alcool est dangereux pour la santé, à consommer avec modération.";

// Display-only French spacing for names copied verbatim from the content files: narrow no-break space
// inside « » and before : ; ! ?, and a no-break space before a dash so a line never starts with « – ».
export function frenchSpaces(text: string): string {
  return text
    .replace(/« /g, "«\u202F")
    .replace(/ ([»:;!?])/g, "\u202F$1")
    .replace(/ – /g, "\u00A0– ");
}

/**
 * Splits a dish name into its title and the rest, both verbatim: at the first comma outside parentheses
 * (« Filet de bœuf d'Aubrac (France) » + « , pomme Anna, … »), or before a closing description in
 * parentheses (« Coupe de glace » + « (2 boules et chantilly) »).
 */
export function splitDish(name: string): [string, string] {
  let depth = 0;
  for (let i = 0; i < name.length; i++) {
    const ch = name[i];
    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    else if (ch === "," && depth === 0) return [name.slice(0, i), name.slice(i)];
  }
  const paren = /^(.+?)( \([^)]{12,}\))$/.exec(name);
  return paren ? [paren[1], paren[2]] : [name, ""];
}

/** « Vin de France « 50-cinquante » 2024 – Domaine Louis Chèze » -> label and producer part (with its dash). */
export function splitWine(name: string): [string, string] {
  const cut = name.indexOf("\u00A0– ");
  return cut < 0 ? [name, ""] : [name.slice(0, cut), name.slice(cut)];
}

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
