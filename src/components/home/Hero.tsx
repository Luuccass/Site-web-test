import Link from "next/link";
import { Photo } from "@/components/media/Photo";
import { StatusLines } from "@/components/status/StatusLines";
import { StatusScript } from "@/components/status/StatusScript";
import { formulesText, hoursSentence, site } from "@/lib/data";

// « L'affiche de la porte »: the navy sign on the pierre dorée wall, with the clip-frame notice made live.
export function Hero() {
  return (
    <section aria-labelledby="hero-status" className="grid lg:min-h-[calc(100svh-4.25rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="bg-stone p-2.5 sm:p-6 lg:flex lg:items-center lg:justify-center lg:p-12 xl:p-16">
        <div className="mx-auto w-full max-w-[36rem] bg-navy px-4 pb-4 pt-6 text-on-navy sm:px-8 sm:pb-8 sm:pt-10">
          <h1 className="sr-only">Restaurant Comme Avant, cuisine française à Dardilly</h1>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            id="hero-logo"
            src="/brand/logo-comme-avant-stacked.svg"
            alt=""
            width={678}
            height={486}
            className="mx-auto h-auto w-[10.5rem] sm:w-[14rem] lg:w-[16.5rem]"
          />
          <div className="m1-notice mt-6 bg-paper px-4 py-5 text-ink sm:mt-9 sm:px-7 sm:py-7">
            <StatusLines
              as="div"
              className="flex flex-col"
              line1ClassName="text-[length:var(--text-display)] font-light leading-[1.05]"
              line2ClassName="mt-1 text-[1.1875rem] text-ink-soft"
            />
            <span id="hero-status" className="sr-only">
              Statut et réservation
            </span>
            <div id="hero-cta" className="cta-row mt-5 flex flex-wrap gap-2.5">
              <Link href="/reserver/" className="cta-book btn btn-solid flex-[1_1_11rem]">
                Réserver une table
              </Link>
              <a href={`tel:${site.phone.e164}`} className="cta-call btn btn-line flex-[1_1_11rem]">
                <span data-call-label suppressHydrationWarning>
                  Appeler
                </span>
              </a>
            </div>
            <p className="mt-5 text-[1.0625rem]" data-price-line suppressHydrationWarning>
              {`Formules du midi : ${formulesText}`}
            </p>
            <p className="mt-3 text-[1.0625rem] text-ink-soft">{hoursSentence}</p>
            <p className="mt-2 text-[1.0625rem]">
              Réservation au{" "}
              <a href={`tel:${site.phone.e164}`} className="tnum inline-flex min-h-11 items-center underline">
                {site.phone.display}
              </a>
            </p>
          </div>
          <StatusScript />
        </div>
      </div>
      <div className="relative overflow-hidden bg-navy">
        <Photo
          id="salle-arche-bar"
          alt="La salle du restaurant : arche en pierre dorée, suspensions en rotin et bar aux carreaux émaillés bleu marine"
          sizes="(min-width: 1024px) 50vw, 100vw"
          ratio={4 / 5}
          focal={[0.55, 0.55]}
          priority
          className="h-full lg:!aspect-auto lg:absolute lg:inset-0"
          imgClassName="m1-photo"
        />
      </div>
    </section>
  );
}
