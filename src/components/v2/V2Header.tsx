"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const LINKS = [
  { href: "/la-carte/", label: "La carte" },
  { href: "/la-carte/vins/", label: "Les vins" },
  { href: "/le-restaurant/", label: "Le restaurant" },
  { href: "/galerie/", label: "Galerie" },
  { href: "/nous-trouver/", label: "Accès" },
];

// Transparent over the hero, night-blue glass once the page scrolls. On phones the menu is a
// full-screen sheet with very large links.
export function V2Header({ phone }: { phone: { display: string; e164: string } }) {
  const [solid, setSolid] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500 ${
        solid ? "border-b border-gold/15 bg-night/80 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[96rem] items-center gap-6 px-5 sm:h-20 sm:px-10">
        <Link href="/apercu/" aria-label="Comme Avant, accueil" className="inline-flex min-h-11 items-center" data-cursor="">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-comme-avant-compact.svg" alt="" width={113} height={50} className="h-9 w-auto sm:h-10" />
        </Link>
        <nav aria-label="Navigation principale" className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-8">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="v2-label inline-flex min-h-11 items-center !tracking-[0.24em] !text-cream transition-colors hover:!text-gold">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <a href={`tel:${phone.e164}`} className="tnum hidden min-h-11 items-center text-[1.0625rem] text-cream/80 transition-colors hover:text-gold xl:inline-flex">
          {phone.display}
        </a>
        <Link href="/reserver/" className="v2-btn v2-btn-gold ml-auto !min-h-11 !px-5 lg:ml-0">
          Réserver
        </Link>
        <button
          type="button"
          className="v2-label inline-flex min-h-11 items-center gap-3 !text-cream lg:hidden"
          aria-haspopup="dialog"
          aria-controls="v2-menu"
          onClick={() => dialogRef.current?.showModal()}
        >
          Menu
          <svg aria-hidden="true" width="22" height="10" viewBox="0 0 22 10" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M0 1h22M6 9h16" />
          </svg>
        </button>
      </div>

      <dialog id="v2-menu" ref={dialogRef} aria-label="Menu" className="m-0 h-dvh max-h-none w-full max-w-none bg-night p-0 text-cream backdrop:bg-night">
        <div className="flex h-full flex-col px-5 pb-10 pt-4">
          <div className="flex items-center justify-between">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-comme-avant-compact.svg" alt="" width={113} height={50} className="h-9 w-auto" />
            <form method="dialog">
              <button type="submit" className="v2-label inline-flex min-h-11 items-center !text-cream">
                Fermer
              </button>
            </form>
          </div>
          <nav aria-label="Rubriques" className="mt-12">
            <ul className="space-y-1">
              {[{ href: "/apercu/", label: "Accueil" }, ...LINKS].map((l, i) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => dialogRef.current?.close()}
                    className="v2-display flex min-h-14 items-baseline gap-4 text-[clamp(2.75rem,13vw,4.5rem)]"
                  >
                    <span className="v2-label !tracking-[0.2em]">{String(i + 1).padStart(2, "0")}</span>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto grid gap-3">
            <Link href="/reserver/" className="v2-btn v2-btn-gold w-full">
              Réserver une table
            </Link>
            <a href={`tel:${phone.e164}`} className="v2-btn v2-btn-line tnum w-full">
              Appeler le {phone.display}
            </a>
          </div>
        </div>
      </dialog>
    </header>
  );
}
