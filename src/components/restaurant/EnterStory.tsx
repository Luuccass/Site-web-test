import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { Photo } from "@/components/media/Photo";
import { Door } from "@/components/motion/Door";
import { AlcoholNotice } from "@/components/ui/AlcoholNotice";
import { gallery, site, wines } from "@/lib/data";
import { StoryMotion } from "./StoryMotion";
import "./enter-story.css";

// « Entrer chez Comme Avant »: the house in three steps, la ruelle → la salle → la cave.
// One server-rendered DOM for every mode: the text steps are an ordinary list in reading order;
// the stacked photos (M2m doors) serve mobile, reduced motion and no-JS; the sticky stage (M2) is
// a visual duplicate shown only on desktop with motion allowed (see enter-story.css, StoryMotion).

const ROOT_ID = "entrer-chez-comme-avant";

/** The wine list leans on the Rhône and Burgundy: say so only while wines.json still shows it. */
function rhoneAndBurgundyLead() {
  const count = new Map<string, number>();
  for (const bottle of wines.bottles) count.set(bottle.region, (count.get(bottle.region) ?? 0) + 1);
  const top = [...count.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([region]) => region);
  return top.includes("Vallée du Rhône") && top.includes("Bourgogne");
}

type Step = {
  id: string;
  title: string;
  photo: string;
  /** The ruelle photo is only 1060 px wide: keep it a medium framed image, never full-bleed. */
  narrow?: boolean;
  body: ReactNode;
};

const STEPS: Step[] = [
  {
    id: "ruelle",
    title: "La ruelle",
    photo: "exterieur-ruelle",
    narrow: true,
    body: (
      <>
        <p>
          La maison en pierre dorée est au {site.address.street}, dans la petite ruelle piétonne à côté de
          l&apos;église de Dardilly-le-Bas.
        </p>
        <p>
          <Link href="/nous-trouver/" className="link-draw inline-flex min-h-11 items-center text-on-navy [background-position:0_calc(100%-0.55rem)]">
            Horaires et accès
          </Link>
        </p>
      </>
    ),
  },
  {
    id: "salle",
    title: "La salle",
    photo: "salle-arche-bar",
    body: (
      <p>
        Une arche en pierre dorée, des suspensions en rotin, le bar aux carreaux émaillés bleu marine et, au sol,
        des carreaux de ciment. Le long d&apos;un mur, les bouteilles sont rangées dans des niches arrondies et
        éclairées.
      </p>
    ),
  },
  {
    id: "cave",
    title: "La cave",
    photo: "salle-cave-chartreuse",
    body: (
      <>
        <p>Une cave vitrée en arc de cercle sur un mur en terre cuite, et le coin Chartreuse sous une affiche ancienne.</p>
        <p>
          La carte compte {wines.bottles.length} références en bouteille
          {rhoneAndBurgundyLead() ? ", surtout de la vallée du Rhône et de Bourgogne," : ""} et des vins au verre ou en
          pot.
        </p>
        <p>
          <Link href="/la-carte/vins/" className="link-draw inline-flex min-h-11 items-center text-on-navy [background-position:0_calc(100%-0.55rem)]">
            Tous les vins
          </Link>
        </p>
        <AlcoholNotice className="text-on-navy-soft" />
      </>
    ),
  },
];

function photoOf(id: string) {
  const p = gallery.photos.find((photo) => photo.id === id);
  if (!p) throw new Error(`Photo "${id}" is missing from content/gallery.json`);
  return p;
}

/** Same sizes for the stacked photo and its stage copy: on desktop both pick the same file. */
function sizesFor(step: Step) {
  return `(min-width: 1024px) 34rem, (min-width: 768px) 42vw, ${step.narrow ? "min(100vw, 24rem)" : "100vw"}`;
}

export function EnterStory() {
  const total = STEPS.length;
  return (
    <section id={ROOT_ID} aria-labelledby="entrer" className="ca-story on-navy bg-navy text-on-navy">
      <div className="mx-auto max-w-[84rem] px-4 py-16 sm:px-8 sm:py-24 lg:px-12">
        <h2 id="entrer" className="text-[length:var(--text-h2)]">
          Entrer chez Comme Avant
        </h2>
        <p className="measure mt-5 text-on-navy-soft">De la ruelle à la cave, en trois pas.</p>

        <div className="ca-story__grid mt-12 sm:mt-16" data-story-grid>
          <ol className="ca-story__steps grid gap-16 sm:gap-24">
            {STEPS.map((step, i) => {
              const photo = photoOf(step.photo);
              return (
                <li
                  key={step.id}
                  data-step
                  className="ca-story__step grid gap-8 md:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] md:items-center md:gap-12"
                >
                  <div className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-3 sm:grid-cols-[3.5rem_minmax(0,1fr)]">
                    <p aria-hidden="true" className="tnum pt-[0.3rem] text-[1.0625rem] text-on-navy-soft">
                      {i + 1}/{total}
                    </p>
                    <div className="measure">
                      <h3 className="text-[length:var(--text-h3)] font-medium">{step.title}</h3>
                      <div className="mt-4 space-y-4 text-on-navy-soft">{step.body}</div>
                    </div>
                  </div>
                  <div className="ca-story__media">
                    <Door className={step.narrow ? "mx-auto w-full max-w-[24rem]" : "w-full"}>
                      <Photo id={photo.id} alt={photo.alt} sizes={sizesFor(step)} ratio={4 / 5} focal={photo.focal} />
                    </Door>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Desktop stage: decorative duplicate of the photos above (their alt texts stay in the list). */}
          <div className="ca-story__stage" aria-hidden="true">
            <div className="ca-story__frame">
              {STEPS.map((step, i) => {
                const photo = photoOf(step.photo);
                return (
                  <Fragment key={step.id}>
                    <div className="ca-story__layer" data-layer={i}>
                      <div className="ca-story__zoom" data-zoom={i}>
                        <Photo
                          id={photo.id}
                          alt=""
                          sizes={sizesFor(step)}
                          ratio={4 / 5}
                          focal={photo.focal}
                          className="h-full w-full"
                        />
                      </div>
                    </div>
                    <span className="ca-story__leaf ca-story__leaf--l" data-leaf-l={i} />
                    <span className="ca-story__leaf ca-story__leaf--r" data-leaf-r={i} />
                  </Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <StoryMotion targetId={ROOT_ID} />
    </section>
  );
}
