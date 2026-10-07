"use client";

import { useEffect, useRef } from "react";

// Desktop only (fine pointer, motion allowed): a gold ring that follows the pointer with a little lag
// and grows with a word (data-cursor="Voir") over photos and calls to action. Purely decorative: the
// system cursor stays visible, so nothing depends on it.
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
    let x = -100,
      y = -100,
      cx = -100,
      cy = -100,
      raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      el.dataset.on = "1";
      const target = (e.target as Element | null)?.closest<HTMLElement>("[data-cursor]");
      const label = target?.dataset.cursor ?? "";
      if (el.dataset.label !== label) {
        el.dataset.label = label;
        el.textContent = label;
      }
    };
    const leave = () => (el.dataset.on = "0");
    const loop = () => {
      cx += (x - cx) * 0.18;
      cy += (y - cy) * 0.18;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
    };
  }, []);
  return <div ref={ref} className="v2-cursor" aria-hidden="true" data-on="0" />;
}
