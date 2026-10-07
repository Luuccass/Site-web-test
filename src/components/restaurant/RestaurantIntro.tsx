import Link from "next/link";
import { FRAME_FOCAL } from "@/components/gallery/layout";
import { Photo } from "@/components/media/Photo";
import { gallery, site } from "@/lib/data";

// Page opening: who welcomes you and the plain facts about the house (no biography, no roles:
// both are still to be confirmed by the owners).
export function RestaurantIntro() {
  const sign = gallery.photos.find((p) => p.id === "enseigne");
  return (
    <section aria-labelledby="page-titre" className="mx-auto max-w-[84rem] px-4 pb-16 pt-12 sm:px-8 sm:pb-24 sm:pt-16 lg:px-12">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
        <div>
          <h1 id="page-titre" className="text-[length:var(--text-h1)]">
            Le restaurant
          </h1>
          <p className="measure mt-8 text-[1.3125rem] leading-[1.5] sm:text-[1.5rem]">
            {site.owners} vous accueillent dans une maison en pierre dorée, dans la petite ruelle piétonne à côté de
            l&apos;église de Dardilly-le-Bas.
          </p>
          <p className="measure mt-5 text-ink-soft">
            À l&apos;intérieur, une salle sous l&apos;arche, des carreaux de ciment, le mur des vins éclairé, la cave et son
            coin Chartreuse. Dehors, une terrasse au calme. Une cuisine de saison, avec les suggestions et la broche du
            jour selon arrivage.
          </p>
          <p className="mt-6">
            <Link href="/la-carte/" className="btn btn-line">
              Voir la carte
            </Link>
          </p>
        </div>
        {sign ? (
          <figure>
            <Photo
              id={sign.id}
              alt={sign.alt}
              sizes="(min-width: 1344px) 34rem, (min-width: 1024px) 40vw, 100vw"
              ratio={3 / 2}
              focal={FRAME_FOCAL.enseigne ?? sign.focal}
              priority
            />
            <figcaption className="mt-3 text-[1rem] text-ink-soft">{sign.caption}</figcaption>
          </figure>
        ) : null}
      </div>
    </section>
  );
}
