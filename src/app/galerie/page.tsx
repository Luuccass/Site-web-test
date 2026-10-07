import type { Metadata } from "next";
import { Gallery } from "@/components/gallery/Gallery";
import { PageHero } from "@/components/v2/PageHero";

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
      <PageHero
        photo="nuit-salle-cave-chartreuse"
        alt="Table ronde dressée devant la cave vitrée en arc de cercle et l'affiche ancienne de Chartreuse"
        focal={[0.5, 0.55]}
        label="En images"
        title={<em className="italic text-gold">Galerie</em>}
        intro="La maison à côté de l'église de Dardilly-le-Bas, et quelques assiettes des derniers mois."
      />
      <Gallery />
    </>
  );
}
