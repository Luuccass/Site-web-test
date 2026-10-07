import { CarteTeaser } from "@/components/home/CarteTeaser";
import { CaveWall } from "@/components/home/CaveWall";
import { DoorTeaser } from "@/components/home/DoorTeaser";
import { Hero } from "@/components/home/Hero";
import { Photo } from "@/components/media/Photo";
import { Reviews } from "@/components/reviews/Reviews";
import { RestaurantJsonLd } from "@/components/seo/JsonLd";
import { HoursPlaque } from "@/components/visit/HoursPlaque";

export default function Home() {
  return (
    <>
      <Hero />
      <Reviews compact />
      <CarteTeaser />
      <DoorTeaser />
      <CaveWall />
      <Reviews />
      <section aria-labelledby="horaires-acces" className="mx-auto max-w-[84rem] px-4 py-16 sm:px-8 sm:py-24 lg:px-12">
        <HoursPlaque />
      </section>
      <figure className="mx-auto max-w-[84rem] px-4 pb-16 sm:px-8 sm:pb-24 lg:px-12">
        <Photo
          id="dessert-moelleux-chocolat"
          alt="Gâteau au chocolat en cocotte noire, une plaquette en chocolat « Restaurant Comme Avant Dardilly » posée dessus"
          sizes="(min-width: 1344px) 1248px, 100vw"
          ratio={21 / 9}
          focal={[0.48, 0.45]}
        />
        <figcaption className="mt-3 text-ink-soft">La plaquette de la maison, sur un dessert des derniers mois.</figcaption>
      </figure>
      <RestaurantJsonLd />
    </>
  );
}
