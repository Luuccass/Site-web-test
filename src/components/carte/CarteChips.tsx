"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

type Chip = { id: string; label: string };

// Sticky chip nav of the carte (M4 « La carte vivante »).
// - Scroll-spy: the chip of the section being read gets aria-current; focus never moves.
// - One indicator bar slides under the current chip (translateX + scaleX, transform only).
// - Sticks right under the site header and follows it when the header hides on scroll down.
// Without JavaScript the chips are plain in-page links.
const BASE = 100; // indicator width in px before scaleX

export function CarteChips({ chips, more }: { chips: Chip[]; more: { href: string; label: string } }) {
  const navRef = useRef<HTMLElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Anchored headings and focused elements must clear the header and this bar.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const root = document.documentElement;
    const apply = () => root.style.setProperty("scroll-padding-top", `calc(var(--sticky-top) + ${nav.offsetHeight}px + 1rem)`);
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(nav);
    return () => {
      ro.disconnect();
      root.style.removeProperty("scroll-padding-top");
    };
  }, []);

  // Scroll-spy: the current section is the last one whose top has passed a reading line under the bar.
  useEffect(() => {
    const sections = chips.map((c) => document.getElementById(c.id)).filter((el): el is HTMLElement => el !== null);
    let frame = 0;
    const compute = () => {
      frame = 0;
      const barBottom = navRef.current?.getBoundingClientRect().bottom ?? 0;
      const line = barBottom + Math.min(window.innerHeight * 0.25, 160);
      let current: string | null = null;
      for (const s of sections) if (s.getBoundingClientRect().top <= line) current = s.id;
      const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      const last = sections[sections.length - 1];
      if (atEnd && last && last.getBoundingClientRect().top < window.innerHeight) current = last.id;
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [chips]);

  // Place the indicator under the current chip and keep that chip visible in the strip.
  const place = useCallback(() => {
    const strip = stripRef.current;
    const bar = barRef.current;
    if (!strip || !bar) return;
    const chip = active ? strip.querySelector<HTMLElement>(`[data-chip="${active}"]`) : null;
    if (!chip) {
      bar.style.opacity = "0";
      return;
    }
    const inset = 12; // matches the chip's horizontal padding: the bar sits under the word
    const width = Math.max(chip.offsetWidth - inset * 2, 8);
    bar.style.transform = `translateX(${chip.offsetLeft + inset}px) scaleX(${width / BASE})`;
    bar.style.opacity = "1";
    const left = chip.offsetLeft;
    const right = left + chip.offsetWidth;
    if (left < strip.scrollLeft || right > strip.scrollLeft + strip.clientWidth) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      strip.scrollTo({ left: left - (strip.clientWidth - chip.offsetWidth) / 2, behavior: reduce ? "auto" : "smooth" });
    }
  }, [active]);

  useLayoutEffect(() => {
    place();
    // First placement without a slide, then enable the transition.
    if (!ready && active) {
      const id = requestAnimationFrame(() => setReady(true));
      return () => cancelAnimationFrame(id);
    }
  }, [place, ready, active]);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const ro = new ResizeObserver(() => place());
    ro.observe(strip);
    return () => ro.disconnect();
  }, [place]);

  return (
    <nav
      ref={navRef}
      aria-label="Rubriques de la carte"
      className="no-print sticky top-(--sticky-top) z-30 border-b border-line bg-paper transition-[top] duration-300 motion-reduce:transition-none [@media(max-height:500px)]:static"
    >
      <div className="mx-auto max-w-[84rem] px-1 sm:px-5 lg:px-9">
        <div
          ref={stripRef}
          className="relative mx-auto max-w-[51.5rem] overflow-x-auto [scrollbar-width:none] max-lg:[mask-image:linear-gradient(90deg,transparent,#000_12px,#000_calc(100%-12px),transparent)] [&::-webkit-scrollbar]:hidden"
        >
          <ul className="flex">
            {chips.map((c) => (
              <li key={c.id} className="shrink-0">
                <a
                  href={`#${c.id}`}
                  data-chip={c.id}
                  aria-current={active === c.id ? "true" : undefined}
                  className="inline-flex min-h-12 items-center px-3 text-[1.0625rem] text-ink-soft no-underline transition-colors duration-200 hover:text-ink aria-[current=true]:text-ink"
                >
                  {c.label}
                </a>
              </li>
            ))}
            <li className="shrink-0">
              <Link href={more.href} className="inline-flex min-h-12 items-center px-3 text-[1.0625rem] text-ink-soft no-underline hover:text-ink">
                {more.label}
              </Link>
            </li>
          </ul>
          <span
            ref={barRef}
            aria-hidden="true"
            className={`pointer-events-none absolute bottom-0 left-0 h-[3px] origin-left bg-navy opacity-0 ${
              ready ? "transition-[transform,opacity] duration-300 ease-(--ease-out-soft) motion-reduce:transition-none" : ""
            }`}
            style={{ width: BASE }}
          />
        </div>
      </div>
    </nav>
  );
}
