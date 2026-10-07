"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { StatusLines } from "@/components/status/StatusLines";
import { NAV } from "@/lib/nav";

type Props = { phone: { display: string; e164: string }; address: string };

export function Header({ phone, address }: Props) {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  // On the home page the big sign already shows the wordmark: the header shows the rosette until it scrolls away.
  const [heroLogoVisible, setHeroLogoVisible] = useState(false);
  useEffect(() => {
    const target = document.getElementById("hero-logo");
    if (!target) {
      setHeroLogoVisible(false);
      return;
    }
    const io = new IntersectionObserver(([e]) => setHeroLogoVisible(e.isIntersecting));
    io.observe(target);
    return () => io.disconnect();
  }, [pathname]);

  // Hide on scroll down, show on scroll up; expose the visible height for scroll-padding.
  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      const h = headerRef.current?.offsetHeight ?? 0;
      const goingDown = y > last + 4;
      const goingUp = y < last - 4;
      if (y < h) setHidden(false);
      else if (goingDown) setHidden(true);
      else if (goingUp) setHidden(false);
      last = y;
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const h = headerRef.current?.offsetHeight ?? 0;
    document.documentElement.style.setProperty("--sticky-top", hidden ? "0px" : `${h}px`);
  }, [hidden]);

  // Close the sheet on navigation.
  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  const isCurrent = (href: string) => pathname === href || (href !== "/la-carte/" && pathname.startsWith(href));

  return (
    <header
      ref={headerRef}
      className={`site-header on-navy sticky top-0 z-40 bg-navy text-on-navy transition-transform duration-300 ${hidden && !open ? "-translate-y-full" : ""}`}
      style={{ viewTransitionName: "site-header" }}
    >
      <div className="mx-auto flex max-w-[84rem] items-center gap-4 px-4 py-2.5 sm:px-8 lg:px-12">
        <Link href="/" aria-label="Comme Avant, accueil" className="relative -my-1 inline-flex min-h-11 min-w-11 items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo-comme-avant-compact.svg"
            alt=""
            width={113}
            height={50}
            className={`h-9 w-auto transition-opacity duration-300 sm:h-11 ${heroLogoVisible ? "opacity-0" : "opacity-100"}`}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon.svg"
            alt=""
            width={36}
            height={36}
            className={`absolute left-0 top-1/2 h-9 w-9 -translate-y-1/2 transition-opacity duration-300 ${heroLogoVisible ? "opacity-100" : "opacity-0"}`}
          />
        </Link>

        <nav aria-label="Navigation principale" className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-7 text-[1.0625rem] font-medium">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="link-draw inline-flex min-h-11 items-center" aria-current={isCurrent(item.href) ? "page" : undefined}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <a href={`tel:${phone.e164}`} className="link-draw hidden min-h-11 items-center tnum text-[1.0625rem] font-medium lg:inline-flex">
          {phone.display}
        </a>
        <Link href="/reserver/" className="btn btn-solid hidden lg:inline-flex">
          Réserver
        </Link>

        <div className="ml-auto flex items-center gap-1 lg:hidden">
          <Link href="/la-carte/" className="inline-flex min-h-11 items-center px-3 text-[1.0625rem] font-medium" aria-current={isCurrent("/la-carte/") ? "page" : undefined}>
            La carte
          </Link>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center gap-2 rounded-[2px] border border-line-navy px-3 text-[1.0625rem] font-medium"
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls="plus-sheet"
            onClick={() => {
              dialogRef.current?.showModal();
              setOpen(true);
            }}
          >
            Plus
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </div>

      <dialog
        id="plus-sheet"
        ref={dialogRef}
        aria-label="Plus de rubriques"
        className="plus-sheet on-navy m-0 h-dvh max-h-none w-full max-w-none bg-navy p-0 text-on-navy"
        onClose={() => setOpen(false)}
      >
        <div className="flex h-full flex-col overflow-y-auto px-4 pb-8 pt-3">
          <div className="flex items-center justify-between">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-comme-avant-compact.svg" alt="" width={113} height={50} className="h-9 w-auto" />
            <form method="dialog">
              <button type="submit" className="inline-flex min-h-11 items-center gap-2 rounded-[2px] border border-line-navy px-3 text-[1.0625rem] font-medium">
                Fermer
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </form>
          </div>
          <nav aria-label="Rubriques" className="mt-8">
            <ul className="divide-y divide-line-navy/40 border-y border-line-navy/40">
              <li>
                <Link href="/" className="flex min-h-14 items-center text-2xl font-light">
                  Accueil
                </Link>
              </li>
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="flex min-h-14 items-center text-2xl font-light" aria-current={isCurrent(item.href) ? "page" : undefined}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-8 grid gap-3">
            <StatusLines className="flex flex-col" line1ClassName="text-xl" line2ClassName="text-on-navy-soft" />
            <Link href="/reserver/" className="btn btn-solid mt-2 w-full">
              Réserver une table
            </Link>
            <a href={`tel:${phone.e164}`} className="btn btn-line w-full tnum">
              Appeler le {phone.display}
            </a>
            <p className="mt-3 text-on-navy-soft">{address}</p>
          </div>
        </div>
      </dialog>
    </header>
  );
}
