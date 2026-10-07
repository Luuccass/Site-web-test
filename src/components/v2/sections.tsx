import Link from "next/link";
import { Photo } from "@/components/media/Photo";
import { StatusLines } from "@/components/status/StatusLines";
import { StatusScript } from "@/components/status/StatusScript";
import { AlcoholNotice } from "@/components/ui/AlcoholNotice";
import { LaterSlides } from "@/components/v2/LaterSlides";
import {
  directionsUrl,
  euro,
  frenchDate,
  gallery,
  hoursSentence,
  menu,
  reviews,
  site,
  weekTable,
  wines,
} from "@/lib/data";

// V2 « Nocturne » home sections. Photos are the owner's, in the « nuit-* » grade (tone and colour only).
// Every motion hook is a data attribute read by V2Motion; without JS each section is complete.

const alt = (id: string) => gallery.photos.find((p) => p.id === id)?.alt ?? "";

/* ── Intro: the door opens on the dining room (first visit of the session, CSS only) ───────── */
export function Intro() {
  return (
    <div className="v2-intro" aria-hidden="true">
      <div className="v2-intro__leaf v2-intro__leaf--l" />
      <div className="v2-intro__leaf v2-intro__leaf--r" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="v2-intro__mark"
        src="/brand/logo-comme-avant.svg"
        alt=""
        width={240}
        height={240}
      />
    </div>
  );
}

/* ── Hero ──────────────────────────────────────────────────────────────────────────────────── */
const HERO = [
  {
    id: "nuit-salle-mur-vins-paysage",
    src: "salle-mur-vins-paysage",
    focal: [0.5, 0.45] as [number, number],
  },
  {
    id: "nuit-salle-arche-bar",
    src: "salle-arche-bar",
    focal: [0.55, 0.5] as [number, number],
  },
  {
    id: "nuit-exterieur-ruelle",
    src: "exterieur-ruelle",
    focal: [0.5, 0.4] as [number, number],
  },
];

export function Hero() {
  return (
    <section
      aria-labelledby="v2-title"
      className="v2-grain relative flex min-h-[100svh] flex-col justify-end overflow-hidden"
    >
      <div className="absolute inset-0" data-parallax="0.25">
        <div className="v2-hero-slide">
          <Photo
            id={HERO[0].id}
            alt={alt(HERO[0].src)}
            sizes="100vw"
            priority
            focal={HERO[0].focal}
            className="!absolute inset-0 h-full !aspect-auto"
          />
        </div>
        {/* The next photos join only after the page has loaded, so they never compete with the first. */}
        <LaterSlides>
          {HERO.slice(1).map((h) => (
            <div key={h.id} className="v2-hero-slide">
              <Photo
                id={h.id}
                alt=""
                sizes="100vw"
                focal={h.focal}
                className="!absolute inset-0 h-full !aspect-auto"
              />
            </div>
          ))}
        </LaterSlides>
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,16,32,0.6)_0%,rgba(11,16,32,0.1)_22%,rgba(11,16,32,0.55)_45%,rgba(11,16,32,0.95)_75%)] lg:bg-[linear-gradient(180deg,rgba(11,16,32,0.55)_0%,rgba(11,16,32,0)_25%,rgba(11,16,32,0.2)_60%,rgba(11,16,32,0.9)_100%),linear-gradient(90deg,rgba(11,16,32,0.75)_0%,rgba(11,16,32,0)_60%)]"
      />

      <div className="relative z-[3] mx-auto w-full max-w-[96rem] px-5 pb-10 pt-32 sm:px-10 sm:pb-14">
        <p className="v2-label v2-hero-in">Restaurant · Dardilly-le-Bas</p>
        <h1
          id="v2-title"
          className="v2-display v2-hero-in mt-5 text-[clamp(4.6rem,19vw,15.5rem)]"
          style={{ "--d": "0.08s" } as React.CSSProperties}
        >
          <span className="sr-only">Restaurant </span>Comme{" "}
          <em className="block pl-[0.06em] italic text-gold sm:inline sm:pl-0">
            Avant
          </em>
        </h1>
        <div className="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div
            className="v2-hero-in max-w-[34rem]"
            style={{ "--d": "0.18s" } as React.CSSProperties}
          >
            <p className="text-[clamp(1.125rem,1rem+0.5vw,1.375rem)] leading-relaxed text-cream/90">
              Cuisine française de saison et broche du jour, dans une maison de
              pierre dorée à deux pas de l&apos;église.
            </p>
            <div className="mt-7 flex items-center gap-3 text-[1.0625rem]">
              <span aria-hidden="true" className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gold" />
              </span>
              <StatusLines
                className="flex flex-wrap gap-x-2"
                line1ClassName="text-cream"
                line2ClassName="text-cream/70"
              />
            </div>
            <div id="hero-cta" className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/reserver/"
                className="v2-btn v2-btn-gold"
                data-cursor="Réserver"
              >
                Réserver une table
              </Link>
              <Link
                href="/la-carte/"
                className="v2-btn v2-btn-line"
                data-cursor="La carte"
              >
                Voir la carte
              </Link>
            </div>
          </div>
          <div
            className="v2-hero-in hidden items-end gap-5 lg:flex"
            style={{ "--d": "0.3s" } as React.CSSProperties}
          >
            <p className="v2-label !text-cream/70 [writing-mode:vertical-rl] rotate-180">
              Défiler
            </p>
            <span className="v2-cue" aria-hidden="true" />
          </div>
        </div>
      </div>
      <StatusScript />
    </section>
  );
}

/* ── Marquee ───────────────────────────────────────────────────────────────────────────────── */
const MARQUEE = [
  "Cuisine de saison",
  "Broche du jour selon arrivage",
  `Formules du midi ${menu.formules.items.map((f) => euro(f.price)).join(" · ")}`,
  `${wines.bottles.length} vins à la carte`,
  "Dardilly-le-Bas",
];

export function Marquee() {
  const row = (hidden: boolean) => (
    <ul
      className="flex shrink-0 items-center"
      aria-hidden={hidden || undefined}
    >
      {MARQUEE.map((m) => (
        <li key={m} className="flex items-center">
          <span className="v2-display whitespace-nowrap px-8 text-[clamp(2.25rem,5vw,4.5rem)] italic text-cream/90">
            {m}
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon.svg"
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 opacity-80"
          />
        </li>
      ))}
    </ul>
  );
  return (
    <section
      aria-label="En bref"
      className="overflow-hidden border-y border-gold/20 py-7 sm:py-9"
    >
      <div className="v2-marquee">
        {row(false)}
        {row(true)}
      </div>
    </section>
  );
}

/* ── Manifesto: words light up as you read ─────────────────────────────────────────────────── */
const MANIFESTO =
  "Une maison de pierre dorée, une salle sous l'arche, un mur de vins éclairé. On y cuisine les saisons, la broche du jour selon arrivage, et l'on y reçoit comme avant.";

export function Manifesto() {
  return (
    <section
      aria-label="La maison"
      className="mx-auto max-w-[96rem] px-5 py-28 sm:px-10 sm:py-40"
    >
      <p className="v2-label">La maison</p>
      <p
        className="v2-display v2-words mt-8 max-w-[22ch] text-[clamp(2.4rem,6.4vw,6.25rem)] !leading-[1.02]"
        data-words
      >
        {MANIFESTO.split(" ").map((w, i) => (
          <span key={i} data-w>
            {w}{" "}
          </span>
        ))}
      </p>
      <div className="mt-12 flex flex-wrap items-center gap-6">
        <Link
          href="/le-restaurant/"
          className="v2-btn v2-btn-line"
          data-cursor="Entrer"
        >
          Découvrir le restaurant
        </Link>
        <p className="text-cream/70">
          Magali et Fabrice Guillon vous accueillent du mardi au samedi.
        </p>
      </div>
    </section>
  );
}

/* ── The arch opens onto the dining room (pinned, scrubbed) ────────────────────────────────── */
export function ArchReveal() {
  return (
    <section aria-label="La salle" className="relative" data-arch>
      <div
        className="relative flex h-[100svh] items-center justify-center overflow-hidden"
        data-arch-stage
      >
        <div className="v2-grain absolute inset-0" data-arch-frame>
          <Photo
            id="nuit-salle-arche-bar"
            alt={alt("salle-arche-bar")}
            sizes="100vw"
            focal={[0.55, 0.5]}
            className="!absolute inset-0 h-full !aspect-auto"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,16,32,0)_45%,rgba(11,16,32,0.85)_100%)]"
          />
        </div>
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] mx-auto max-w-[96rem] px-5 pb-12 sm:px-10 sm:pb-16"
          data-arch-text
        >
          <p className="v2-label">La salle</p>
          <p className="v2-display mt-4 text-[clamp(3rem,9vw,8.5rem)]">
            Sous l&apos;<em className="italic text-gold">arche</em>
          </p>
          <p className="mt-4 max-w-[30rem] text-cream/85">
            La pierre dorée, les suspensions en rotin, le bar aux carreaux
            émaillés bleu marine et, au sol, des carreaux de ciment.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── La carte ──────────────────────────────────────────────────────────────────────────────── */
const DISHES = [
  {
    id: "nuit-plat-poulpe",
    src: "plat-poulpe",
    focal: [0.5, 0.5] as [number, number],
  },
  {
    id: "nuit-dessert-moelleux-fruits-rouges",
    src: "dessert-moelleux-fruits-rouges",
    focal: [0.45, 0.45] as [number, number],
  },
  {
    id: "nuit-plat-pate-en-croute",
    src: "plat-pate-en-croute",
    focal: [0.5, 0.55] as [number, number],
  },
];

export function CarteV2() {
  const sections = menu.sections.filter(
    (s) => s.id === "entrees" || s.id === "plats",
  );
  return (
    <section
      aria-labelledby="v2-carte"
      className="relative overflow-hidden bg-[radial-gradient(80%_60%_at_80%_20%,rgba(201,168,106,0.10),transparent_70%),radial-gradient(60%_50%_at_10%_90%,rgba(23,33,59,0.9),transparent_70%)] py-28 sm:py-40"
    >
      <div className="mx-auto grid max-w-[96rem] gap-16 px-5 sm:px-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-24">
        <div>
          <p className="v2-label">
            Carte en vigueur au {frenchDate(menu.updatedAt)}
          </p>
          <h2
            id="v2-carte"
            className="v2-display mt-6 text-[clamp(4rem,12vw,11rem)]"
            data-reveal
          >
            La <em className="italic text-gold">carte</em>
          </h2>

          <div
            className="mt-14 grid gap-px overflow-hidden rounded-[2px] border border-gold/25 sm:grid-cols-2"
            data-reveal
          >
            {menu.formules.items.map((f) => (
              <div key={f.id} className="bg-night-2/70 p-7 sm:p-9">
                <p className="v2-display tnum text-[clamp(3.5rem,7vw,5.5rem)] text-gold">
                  {euro(f.price)}
                </p>
                <p className="mt-3 text-[1.25rem]">{f.label}</p>
                <p className="text-cream/70">{f.detail}</p>
              </div>
            ))}
            <p className="bg-night-2/70 px-7 pb-7 text-cream/70 sm:col-span-2 sm:px-9">
              Formules du midi, {menu.formules.when}.
            </p>
          </div>

          {sections.map((sec) => (
            <div key={sec.id} className="mt-16" data-reveal>
              <h3 className="v2-display text-[clamp(2.25rem,4vw,3.25rem)] italic text-gold">
                {sec.title}
              </h3>
              <ul className="mt-6 divide-y divide-gold/15 border-y border-gold/15">
                {sec.items.map((it) => (
                  <li
                    key={it.id}
                    className="flex items-baseline justify-between gap-6 py-4"
                  >
                    <span className="text-[1.125rem] leading-snug">
                      {it.name}
                    </span>
                    <span className="tnum shrink-0 text-gold">
                      {it.price === null ? "selon arrivage" : euro(it.price)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="mt-12 flex flex-wrap gap-3">
            <Link
              href="/la-carte/"
              className="v2-btn v2-btn-gold"
              data-cursor="La carte"
            >
              Toute la carte
            </Link>
            <Link
              href="/la-carte/vins/"
              className="v2-btn v2-btn-line"
              data-cursor="Les vins"
            >
              Les vins
            </Link>
          </div>
        </div>

        <figure className="relative lg:pt-40">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:block">
            {DISHES.map((d, i) => (
              <div
                key={d.id}
                className={`v2-arch v2-grain relative shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)] ring-1 ring-gold/30 ${
                  i === 0
                    ? "col-span-2 lg:w-[78%]"
                    : i === 1
                      ? "lg:-mt-24 lg:ml-auto lg:w-[58%]"
                      : "lg:-mt-10 lg:w-[52%]"
                }`}
                data-parallax={i === 1 ? "-0.18" : i === 2 ? "0.12" : "0.06"}
                data-cursor="Assiette"
              >
                <Photo
                  id={d.id}
                  alt={alt(d.src)}
                  sizes="(min-width: 1024px) 34vw, 50vw"
                  ratio={4 / 5}
                  focal={d.focal}
                />
              </div>
            ))}
          </div>
          <figcaption className="mt-8 max-w-[22rem] text-cream/70">
            Quelques assiettes des derniers mois. La carte change avec les
            saisons&nbsp;: elles n&apos;y sont peut-être plus.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

/* ── La cave ───────────────────────────────────────────────────────────────────────────────── */
const PICKS = [
  "Saint-Joseph « Les Challeys »",
  "Crozes-Hermitage « Les Meysonniers »",
  "Côte-Rôtie « Fortis »",
  "Givry 2024",
  "Mercurey 2023",
  "Pouilly-Fuissé 2023",
  "Chiroubles « La scandaleuse »",
  "Morgon 2025",
  "Moulin-à-Vent",
];

export function CaveV2() {
  const picks = PICKS.map((n) =>
    wines.bottles.find((b) => b.name.includes(n)),
  ).filter((b): b is NonNullable<typeof b> => !!b);
  return (
    <section aria-labelledby="v2-cave" className="relative overflow-hidden">
      <div className="v2-grain absolute inset-0" data-parallax="0.2">
        <Photo
          id="nuit-salle-mur-vins-paysage"
          alt=""
          sizes="100vw"
          focal={[0.5, 0.4]}
          className="!absolute inset-0 h-full !aspect-auto"
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,16,32,0.96)_0%,rgba(11,16,32,0.6)_30%,rgba(11,16,32,0.72)_70%,rgba(11,16,32,0.98)_100%)] lg:bg-[linear-gradient(90deg,rgba(11,16,32,0.95)_0%,rgba(11,16,32,0.55)_55%,rgba(11,16,32,0.8)_100%)]"
      />
      <div className="relative z-[3] mx-auto grid max-w-[96rem] gap-16 px-5 py-28 sm:px-10 sm:py-40 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center lg:gap-20">
        <div>
          <p className="v2-label">La cave</p>
          <h2 id="v2-cave" className="mt-6" data-reveal>
            <span
              className="v2-display tnum block text-[clamp(8rem,26vw,19rem)] !leading-[0.78] text-gold"
              data-count={wines.bottles.length}
            >
              {wines.bottles.length}
            </span>
            <span className="v2-display mt-4 block text-[clamp(2rem,4vw,3.5rem)] !leading-[1.05]">
              vins à la carte,{" "}
              <em className="italic text-gold">
                surtout du Rhône et de Bourgogne
              </em>
            </span>
          </h2>
          <p className="mt-8 max-w-[28rem] text-cream/80">
            Et des vins au verre ou en pot, du Mâcon-Villages au Côtes du Rhône
            Sablet. Quelques bouteilles de la carte, rangées comme sur le mur de
            la salle&nbsp;:
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Link
              href="/la-carte/vins/"
              className="v2-btn v2-btn-line"
              data-cursor="Les vins"
            >
              Toute la carte des vins
            </Link>
          </div>
          <AlcoholNotice className="mt-6 text-cream/65" />
        </div>
        <ul
          className="wall grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4"
          data-reveal
        >
          {picks.map((w, i) => {
            const [label, ...producer] = w.name.split(" – ");
            return (
              <li
                key={w.name}
                className="cell v2-arch flex min-h-[15rem] flex-col items-center justify-end border border-gold/30 bg-night/60 px-4 pb-6 pt-14 text-center backdrop-blur-[2px]"
                style={{ "--cell-delay": `${i * 70}ms` } as React.CSSProperties}
              >
                <span className="v2-label !text-[0.625rem] !tracking-[0.18em]">
                  {w.region}
                </span>
                <span className="mt-3 text-[1.0625rem] leading-snug">
                  {label.replace(/^(AOP|AOC|IGP) /, "")}
                </span>
                <span className="mt-1 text-[0.9375rem] text-cream/65">
                  {producer.join(" – ")}
                </span>
                <span className="tnum mt-3 text-[1.125rem] text-gold">
                  {euro(w.price)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ── Gallery rail: horizontal, numbered ────────────────────────────────────────────────────── */
const RAIL = [
  "exterieur-ruelle",
  "enseigne",
  "salle-mur-vins-portrait",
  "detail-niche-chartreuse",
  "dessert-moelleux-chocolat",
  "salle-cave-chartreuse",
  "detail-carreaux-ciment",
  "dessert-pomme-pochee",
];

export function GalleryRail() {
  return (
    <section aria-labelledby="v2-maison" className="relative">
      {/* GSAP pins this inner wrapper (never a node whose parent React manages), so client-side
          navigation can still remove the section. */}
      <div
        className="py-28 sm:py-36 lg:flex lg:min-h-[100svh] lg:flex-col lg:justify-center lg:py-20"
        data-rail-section
      >
        <div className="mx-auto flex w-full max-w-[96rem] items-end justify-between gap-6 px-5 sm:px-10">
          <div>
            <p className="v2-label">En images</p>
            <h2
              id="v2-maison"
              className="v2-display mt-6 text-[clamp(3.5rem,8vw,7.5rem)]"
              data-reveal
            >
              La <em className="italic text-gold">maison</em>
            </h2>
          </div>
          <Link
            href="/galerie/"
            className="v2-btn v2-btn-line hidden sm:inline-flex"
            data-cursor="Galerie"
          >
            Toute la galerie
          </Link>
        </div>
        <div
          className="v2-rail mt-12 overflow-x-auto data-[pinned]:overflow-hidden"
          data-rail
          tabIndex={0}
          role="region"
          aria-label="Photos de la maison, défilement horizontal"
        >
          <div
            className="flex w-max gap-5 px-5 sm:gap-8 sm:px-10"
            data-rail-track
          >
            {RAIL.map((id, i) => {
              const p = gallery.photos.find((g) => g.id === id);
              return (
                <figure
                  key={id}
                  className="w-[78vw] shrink-0 sm:w-[46vw] lg:w-[min(28vw,44svh)]"
                  data-cursor="Voir"
                >
                  <div className="v2-grain relative overflow-hidden">
                    <Photo
                      id={`nuit-${id}`}
                      alt={p?.alt ?? ""}
                      sizes="(min-width: 1024px) 28vw, (min-width: 640px) 46vw, 78vw"
                      ratio={4 / 5}
                      focal={(p?.focal as [number, number]) ?? [0.5, 0.5]}
                    />
                  </div>
                  <figcaption className="mt-4 flex items-baseline gap-4">
                    <span className="v2-label tnum">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-cream/85">{p?.caption}</span>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Rating ────────────────────────────────────────────────────────────────────────────────── */
export function RatingBand() {
  const r = reviews.rating;
  return (
    <section aria-label="Avis Google" className="border-y border-gold/20">
      <div
        className="mx-auto flex max-w-[96rem] flex-wrap items-end justify-between gap-8 px-5 py-16 sm:px-10 sm:py-20"
        data-reveal
      >
        <p className="v2-display flex items-end gap-4 text-[clamp(5rem,14vw,12rem)] !leading-[0.8]">
          <span className="tnum text-gold">
            {String(r.value).replace(".", ",")}
          </span>
          <span className="pb-[0.1em] text-[clamp(1.5rem,3vw,2.5rem)] italic">
            sur 5
          </span>
        </p>
        <div className="max-w-[26rem]">
          <p className="text-[1.25rem]">
            {r.count} avis sur Google au {frenchDate(r.asOf)}.
          </p>
          <a
            href={reviews.listingUrl}
            className="mt-3 inline-flex min-h-11 items-center text-gold underline underline-offset-4"
            rel="noopener"
          >
            Lire les avis sur Google
          </a>
        </div>
      </div>
    </section>
  );
}

/* ── Booking call to action over the ruelle at dusk ────────────────────────────────────────── */
export function ReserveV2() {
  return (
    <section
      aria-labelledby="v2-reserver"
      className="relative flex min-h-[100svh] items-end overflow-hidden"
    >
      <div className="v2-grain absolute inset-0" data-parallax="0.2">
        <Photo
          id="nuit-exterieur-ruelle"
          alt={alt("exterieur-ruelle")}
          sizes="100vw"
          focal={[0.5, 0.35]}
          className="!absolute inset-0 h-full !aspect-auto"
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,16,32,0.65)_0%,rgba(11,16,32,0.45)_30%,rgba(11,16,32,0.92)_70%)] lg:bg-[linear-gradient(180deg,rgba(11,16,32,0.6)_0%,rgba(11,16,32,0.2)_35%,rgba(11,16,32,0.92)_100%)]"
      />
      <div className="relative z-[3] mx-auto w-full max-w-[96rem] px-5 pb-16 sm:px-10 sm:pb-24">
        <p className="v2-label">Réservation</p>
        <h2
          id="v2-reserver"
          className="v2-display mt-6 text-[clamp(4rem,13vw,12rem)]"
          data-reveal
        >
          Une table
          <br />
          <em className="italic text-gold">vous attend</em>
        </h2>
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
          <div>
            <StatusLines
              className="flex flex-col text-[1.25rem]"
              line1ClassName="text-cream"
              line2ClassName="text-cream/70"
            />
            <p className="mt-4 max-w-[30rem] text-cream/75">{hoursSentence}</p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link
              href="/reserver/"
              className="v2-btn v2-btn-gold"
              data-cursor="Réserver"
            >
              Réserver en ligne
            </Link>
            <a
              href={`tel:${site.phone.e164}`}
              className="v2-btn v2-btn-line tnum"
            >
              {site.phone.display}
            </a>
            <a
              href={directionsUrl}
              className="v2-btn v2-btn-line"
              rel="noopener"
            >
              Itinéraire
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Footer ────────────────────────────────────────────────────────────────────────────────── */
export function FooterV2() {
  const open = weekTable.filter((d) => d.midi || d.soir);
  return (
    <footer className="border-t border-gold/20 bg-[#080c18]">
      <div className="mx-auto grid max-w-[96rem] gap-14 px-5 py-20 sm:px-10 lg:grid-cols-[minmax(0,5fr)_repeat(3,minmax(0,2fr))]">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo-comme-avant-stacked.svg"
            alt="Restaurant Comme Avant, Dardilly"
            width={678}
            height={486}
            loading="lazy"
            className="h-auto w-52"
          />
          <p className="v2-display mt-10 text-[clamp(2.5rem,5vw,4rem)] italic text-gold">
            <a
              href={`tel:${site.phone.e164}`}
              className="tnum no-underline hover:underline"
            >
              {site.phone.display}
            </a>
          </p>
        </div>
        <div>
          <p className="v2-label">Adresse</p>
          <address className="mt-5 not-italic leading-relaxed text-cream/85">
            {site.address.street}
            <br />
            {site.address.postalCode} {site.address.city}
            <br />
            <span className="text-cream/60">{site.parking}</span>
          </address>
          <a
            href={directionsUrl}
            className="mt-3 inline-flex min-h-11 items-center text-gold underline underline-offset-4"
            rel="noopener"
          >
            Itinéraire
          </a>
        </div>
        <div>
          <p className="v2-label">Horaires</p>
          <dl className="mt-5 space-y-1 text-cream/85">
            {open.map((d) => (
              <div key={d.day} className="flex gap-3">
                <dt className="w-24 shrink-0">{d.label}</dt>
                <dd className="tnum text-cream/65">
                  {[d.midi, d.soir].filter(Boolean).map((r) => (
                    <span key={r} className="block whitespace-nowrap">
                      {r}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <p className="v2-label">Le site</p>
          <ul className="mt-5 space-y-1">
            {[
              ["/la-carte/", "La carte"],
              ["/la-carte/vins/", "Les vins"],
              ["/le-restaurant/", "Le restaurant"],
              ["/galerie/", "Galerie"],
              ["/reserver/", "Réserver"],
              ["/mentions-legales/", "Mentions légales"],
              ["/confidentialite/", "Confidentialité"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link
                  href={href}
                  className="inline-flex min-h-9 items-center text-cream/85 hover:text-gold"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
