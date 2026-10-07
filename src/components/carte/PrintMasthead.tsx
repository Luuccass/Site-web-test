import { site } from "@/lib/data";

// Top of the printed carte: the round navy logo (the white wordmark of the site header would vanish on
// paper) and the address line. Hidden on screen (.print-only); the image still loads so it prints.
export function PrintMasthead() {
  return (
    <div className="print-only mb-[4mm] text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/logo-comme-avant.svg"
        alt={`${site.name}, ${site.address.city}`}
        width={776}
        height={776}
        fetchPriority="low"
        decoding="async"
        className="mx-auto h-[24mm] w-[24mm]"
      />
      <p className="mt-[3mm] text-[9.5pt]">
        {site.address.street}, {site.address.postalCode} {site.address.city}. Réservation au {site.phone.display}
      </p>
    </div>
  );
}
