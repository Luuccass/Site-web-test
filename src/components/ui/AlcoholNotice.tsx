// Mandatory health warning (Loi Évin) wherever wine or spirits are shown.
export function AlcoholNotice({ className = "" }: { className?: string }) {
  return <p className={`text-[1.0625rem] ${className}`}>L&apos;abus d&apos;alcool est dangereux pour la santé, à consommer avec modération.</p>;
}
