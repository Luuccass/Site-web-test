"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// Drives the scroll-triggered motions without any library:
// M2m « La porte s'ouvre » (.door) and M3 « Le mur s'allume » (.wall). Each plays once.
export function MotionObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const doors = Array.from(document.querySelectorAll<HTMLElement>(".door:not(.is-open)"));
    const walls = Array.from(document.querySelectorAll<HTMLElement>(".wall:not(.is-lit)"));
    if (reduce || !("IntersectionObserver" in window)) {
      doors.forEach((d) => d.classList.add("is-open"));
      walls.forEach((w) => w.classList.add("is-lit"));
      return;
    }

    const openDoor = async (door: HTMLElement) => {
      const img = door.querySelector("img");
      try {
        await img?.decode();
      } catch {
        /* open anyway */
      }
      door.classList.add("is-opening");
      window.setTimeout(() => {
        door.classList.add("is-open");
        door.classList.remove("is-opening");
      }, 1200);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          io.unobserve(el);
          if (el.classList.contains("door")) openDoor(el);
          else el.classList.add("is-lit");
        }
      },
      { rootMargin: "0px 0px -20% 0px", threshold: 0.25 },
    );
    doors.forEach((d) => io.observe(d));
    walls.forEach((w) => io.observe(w));
    return () => io.disconnect();
  }, [pathname]);

  // After a client navigation, move focus to the new page's h1 (screen readers announce the page).
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const h1 = document.querySelector<HTMLElement>("main h1");
    if (h1) {
      h1.setAttribute("tabindex", "-1");
      h1.focus({ preventScroll: true });
    }
  }, [pathname]);

  // After the first client navigation, the hero intro (M1) no longer replays.
  useEffect(() => {
    const t = window.setTimeout(() => document.documentElement.setAttribute("data-soft-nav", ""), 1500);
    return () => window.clearTimeout(t);
  }, []);

  return null;
}
