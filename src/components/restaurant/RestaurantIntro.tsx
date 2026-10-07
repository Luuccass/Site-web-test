import Link from "next/link";
import { PageHero } from "@/components/v2/PageHero";
import { site } from "@/lib/data";

// Page opening: the navy enamel sign, who welcomes you, and the plain facts about the house (no
// biography, no roles: both are still to be confirmed by the owners).
export function RestaurantIntro() {
  return (
    <>
      <PageHero
        photo="nuit-enseigne"
        alt="Enseigne bleu marine « Restaurant Comme Avant » fixée sur un mur en pierre dorée"
        focal={[0.36, 0.55]}
        label="Dardilly-le-Bas"
        title={
          <>
            Le <em className="italic text-gold">restaurant</em>
          </>
        }
        intro={`${site.owners} vous accueillent dans une maison en pierre dorée, dans la petite ruelle piétonne à côté de l'église de Dardilly-le-Bas.`}
      />
      <section aria-label="La maison" className="mx-auto max-w-[96rem] px-5 py-20 sm:px-10 sm:py-28">
        <p className="v2-display max-w-[24ch] text-[clamp(2.2rem,5vw,4.5rem)] !leading-[1.05]" data-reveal>
          À l&apos;intérieur, une salle sous l&apos;arche, des carreaux de ciment, le mur des vins éclairé, la cave et son
          coin <em className="italic text-gold">Chartreuse</em>.
        </p>
        <p className="mt-8 max-w-[36rem] text-ink-soft" data-reveal>
          Dehors, une terrasse au calme. Une cuisine de saison, avec les suggestions et la broche du jour selon arrivage.
        </p>
        <p className="mt-8">
          <Link href="/la-carte/" className="btn btn-line" data-cursor="La carte">
            Voir la carte
          </Link>
        </p>
      </section>
    </>
  );
}
