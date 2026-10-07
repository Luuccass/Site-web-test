import type { Metadata } from "next";
import { Gallery } from "@/components/gallery/Gallery";

const description =
  "Photos du restaurant Comme Avant à Dardilly : la ruelle, la salle sous l'arche, le mur des vins, la cave et des assiettes des derniers mois.";

export const metadata: Metadata = {
  title: "Galerie",
  description,
  alternates: { canonical: "/galerie/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Restaurant Comme Avant, Dardilly",
    url: "/galerie/",
    title: "Galerie | Restaurant Comme Avant, Dardilly",
    description,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "La salle du restaurant Comme Avant à Dardilly" }],
  },
};

export default function GaleriePage() {
  return (
    <>
      <section aria-labelledby="page-titre" className="mx-auto max-w-[84rem] px-4 pb-12 pt-12 sm:px-8 sm:pb-16 sm:pt-16 lg:px-12">
        <h1 id="page-titre" className="text-[length:var(--text-h1)]">
          Galerie
        </h1>
        <p className="measure mt-6 text-[1.3125rem] leading-[1.5] sm:text-[1.5rem]">
          La maison de la ruelle de l&apos;église, sa salle, sa cave, et quelques assiettes des derniers mois.
        </p>
      </section>
      <Gallery />
    </>
  );
}
