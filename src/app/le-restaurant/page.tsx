import type { Metadata } from "next";
import { EnterStory } from "@/components/restaurant/EnterStory";
import { GroupsNote } from "@/components/restaurant/GroupsNote";
import { RestaurantIntro } from "@/components/restaurant/RestaurantIntro";
import { site } from "@/lib/data";

const description = `${site.owners} vous accueillent à Dardilly-le-Bas\u202f: maison en pierre dorée près de l'église, salle sous l'arche, cave, terrasse au calme.`;

export const metadata: Metadata = {
  title: "Le restaurant",
  description,
  alternates: { canonical: "/le-restaurant/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Restaurant Comme Avant, Dardilly",
    url: "/le-restaurant/",
    title: "Le restaurant | Restaurant Comme Avant, Dardilly",
    description,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "La salle du restaurant Comme Avant à Dardilly" }],
  },
};

export default function RestaurantPage() {
  return (
    <>
      <RestaurantIntro />
      <EnterStory />
      <GroupsNote />
    </>
  );
}
