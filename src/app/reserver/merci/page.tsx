import type { Metadata } from "next";
import Link from "next/link";
import { ALLERGY_LINE } from "@/components/booking/copy";
import { Sent } from "@/components/booking/Sent";
import { site } from "@/lib/data";

// Shown by Netlify after a booking request sent without JavaScript (form action). With JavaScript the
// same message replaces the form on /reserver/ instead.
export const metadata: Metadata = {
  title: "Demande envoyée",
  description: "Votre demande de réservation au Restaurant Comme Avant à Dardilly est envoyée\u202f: le restaurant vous confirme la table.",
  alternates: { canonical: "/reserver/merci/" },
  robots: { index: false, follow: true },
};

export default function MerciPage() {
  return (
    <div className="mx-auto max-w-[84rem] px-4 pb-16 pt-12 sm:px-8 sm:pb-24 sm:pt-16 lg:px-12">
      <div className="max-w-[50rem]">
        <Sent as="h1" phone={site.phone} />
        <p className="measure mt-8 text-ink-soft">{ALLERGY_LINE}</p>
        <p className="mt-10 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-solid">
            Retour à l&apos;accueil
          </Link>
          <Link href="/la-carte/" className="btn btn-line">
            Voir la carte
          </Link>
        </p>
      </div>
    </div>
  );
}
