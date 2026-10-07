import Link from "next/link";
import { Photo } from "@/components/media/Photo";
import { Door } from "@/components/motion/Door";
import { site } from "@/lib/data";

export function DoorTeaser() {
  return (
    <section aria-labelledby="entrer" className="on-navy bg-navy text-on-navy">
      <div className="mx-auto grid max-w-[84rem] gap-10 px-4 py-16 sm:px-8 sm:py-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-16 lg:px-12">
        <div className="measure">
          <h2 id="entrer" className="text-[length:var(--text-h2)]">
            Entrer chez Comme Avant
          </h2>
          <p className="mt-5 text-on-navy-soft">
            Une maison en pierre dorée dans la petite ruelle de l&apos;église, à Dardilly-le-Bas. Une salle sous l&apos;arche, des carreaux de ciment, le mur des vins éclairé, et une terrasse au calme.
          </p>
          <p className="mt-4 text-on-navy-soft">{site.owners} vous y accueillent, du mardi au samedi.</p>
          <p className="mt-8">
            <Link href="/le-restaurant/" className="btn btn-line">
              Découvrir le restaurant
            </Link>
          </p>
        </div>
        <Door>
          <Photo
            id="salle-mur-vins-paysage"
            alt="Le mur de bouteilles rétroéclairé en niches arrondies, sous quatre suspensions en rotin"
            sizes="(min-width: 1024px) 56vw, 100vw"
            ratio={3 / 2}
            focal={[0.5, 0.45]}
          />
        </Door>
      </div>
    </section>
  );
}
