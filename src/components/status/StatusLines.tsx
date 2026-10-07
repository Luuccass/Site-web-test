// The two status lines. Static HTML holds a time-independent default; StatusScript / StatusUpdater
// replace it with the live state (« Ouvert ce midi », « service jusqu'à 14 h »…).
export function StatusLines({
  className,
  line1ClassName,
  line2ClassName,
  as: Tag = "p",
}: {
  className?: string;
  line1ClassName?: string;
  line2ClassName?: string;
  as?: "p" | "div";
}) {
  return (
    <Tag className={className}>
      <span data-s1 suppressHydrationWarning className={line1ClassName}>
        Horaires d&apos;ouverture
      </span>
      <span data-s2 suppressHydrationWarning className={line2ClassName}>
        midi du mardi au samedi, soir du jeudi au samedi
      </span>
    </Tag>
  );
}
