"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Mobile action bar: Réserver / Appeler / Itinéraire. On the home page it appears as soon as the hero
// buttons leave the screen; elsewhere it is always there. Hidden on /reserver and while typing.
export function StickyBar({ phone, directionsUrl }: { phone: { display: string; e164: string }; directionsUrl: string }) {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);
  const [heroVisible, setHeroVisible] = useState(false);
  const [typing, setTyping] = useState(false);
  const onBookingPage = pathname.startsWith("/reserver");

  useEffect(() => {
    const target = document.getElementById("hero-cta");
    if (!target) {
      setHeroVisible(false);
      return;
    }
    const io = new IntersectionObserver(([entry]) => setHeroVisible(entry.isIntersecting), { threshold: 0.2 });
    io.observe(target);
    return () => io.disconnect();
  }, [pathname]);

  useEffect(() => {
    const isField = (el: EventTarget | null) => el instanceof HTMLElement && el.matches("input, select, textarea");
    const onIn = (e: FocusEvent) => isField(e.target) && setTyping(true);
    const onOut = (e: FocusEvent) => isField(e.target) && setTyping(false);
    document.addEventListener("focusin", onIn);
    document.addEventListener("focusout", onOut);
    return () => {
      document.removeEventListener("focusin", onIn);
      document.removeEventListener("focusout", onOut);
    };
  }, []);

  const shown = !onBookingPage && !heroVisible && !typing;

  useEffect(() => {
    const h = shown && window.matchMedia("(max-width: 767px)").matches ? barRef.current?.offsetHeight ?? 0 : 0;
    document.documentElement.style.setProperty("--bar-h", `${h}px`);
  }, [shown]);

  return (
    <div
      ref={barRef}
      aria-hidden={!shown}
      inert={!shown}
      className={`sticky-bar on-navy fixed inset-x-0 bottom-0 z-30 border-t border-line-navy/50 bg-navy px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 text-on-navy transition-transform duration-300 md:hidden ${shown ? "" : "translate-y-full"}`}
      style={{ viewTransitionName: "sticky-bar" }}
    >
      <div className="cta-row grid grid-cols-3 gap-2">
        <Link href="/reserver/" className="cta-book btn btn-solid px-2 text-base">
          Réserver
        </Link>
        <a href={`tel:${phone.e164}`} className="cta-call btn btn-line px-2 text-base" aria-label={`Appeler le ${phone.display}`}>
          Appeler
        </a>
        <a href={directionsUrl} className="btn btn-line px-2 text-base" rel="noopener">
          Itinéraire
        </a>
      </div>
    </div>
  );
}
