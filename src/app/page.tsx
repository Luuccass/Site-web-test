import { RestaurantJsonLd } from "@/components/seo/JsonLd";
import { ArchReveal, CarteV2, CaveV2, GalleryRail, Hero, Manifesto, Marquee, RatingBand, ReserveV2 } from "@/components/v2/sections";

// Home, V2 « Nocturne »: the door opens on the dining room, then the house, the carte, the cave and
// the booking call over the ruelle at dusk.
export default function Home() {
  return (
    <div className="v2">
      <Hero />
      <Marquee />
      <Manifesto />
      <ArchReveal />
      <CarteV2 />
      <CaveV2 />
      <GalleryRail />
      <RatingBand />
      <ReserveV2 />
      <RestaurantJsonLd />
    </div>
  );
}
