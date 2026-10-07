import Link from "next/link";
import { Photo } from "@/components/media/Photo";
import { ArdoiseLine } from "@/components/menu/ArdoiseLine";
import { MenuList } from "@/components/menu/MenuList";
import { euro, menu } from "@/lib/data";

export function CarteTeaser() {
  const entrees = menu.sections.find((s) => s.id === "entrees")!;
  const plats = menu.sections.find((s) => s.id === "plats")!;
  return (
    <section aria-labelledby="carte-teaser" className="mx-auto max-w-[84rem] px-4 py-16 sm:px-8 sm:py-24 lg:px-12">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
        <div>
          <h2 id="carte-teaser" className="text-[length:var(--text-h2)]">
            La carte
          </h2>
          <ArdoiseLine className="mt-4 text-ink-soft" />
          <div className="mt-8 border-y border-line py-5">
            <p className="font-medium">Formules du midi, {menu.formules.when}</p>
            <ul className="mt-2 grid gap-1">
              {menu.formules.items.map((f) => (
                <li key={f.id} className="flex items-baseline gap-4">
                  <span>
                    {f.label} <span className="text-ink-soft">({f.detail})</span>
                  </span>
                  <span className="tnum ml-auto">{euro(f.price)}</span>
                </li>
              ))}
            </ul>
          </div>
          <MenuList section={entrees} headingLevel={3} className="mt-10" />
          <MenuList section={plats} headingLevel={3} className="mt-10" />
          <p className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/la-carte/" className="btn btn-solid">
              Toute la carte
            </Link>
            <Link href="/la-carte/vins/" className="inline-flex min-h-11 items-center underline">
              Les vins
            </Link>
          </p>
        </div>
        <figure className="grid content-start gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <Photo id="plat-poulpe" alt="Poulpe, pommes de terre et herbes hachées dans une assiette noire posée sur une table en mosaïque" sizes="(min-width: 1024px) 34vw, (min-width: 640px) 46vw, 100vw" ratio={4 / 5} focal={[0.4, 0.5]} />
          <Photo id="plat-entrecote" alt="Pièce de bœuf tranchée rosée, pommes grenaille et sauce crème à la ciboulette sur une assiette noire" sizes="(min-width: 1024px) 34vw, (min-width: 640px) 46vw, 100vw" ratio={1} className="hidden sm:block lg:hidden xl:block" />
          <figcaption className="text-ink-soft sm:col-span-2 lg:col-span-1">
            Quelques assiettes des derniers mois. La carte change avec les saisons.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
