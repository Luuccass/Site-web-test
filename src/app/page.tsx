import { CarteTeaser } from "@/components/home/CarteTeaser";
import { CaveWall } from "@/components/home/CaveWall";
import { DoorTeaser } from "@/components/home/DoorTeaser";
import { Hero } from "@/components/home/Hero";
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
      <RestaurantJsonLd />
    </>
  );
}
