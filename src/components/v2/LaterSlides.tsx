"use client";

import { useEffect, useState } from "react";

// Renders its children once the page has fully loaded (plus a short idle delay), so secondary hero
// photos never compete with the first one for bandwidth. Without JS they simply never appear.
// The slides' CSS cycle is shifted by the time already elapsed (--late), so they stay in step with
// the first photo, whose animation started at first paint.
export function LaterSlides({ children }: { children: React.ReactNode }) {
  const [late, setLate] = useState<number | null>(null);
  useEffect(() => {
    let timer = 0;
    const go = () => {
      timer = window.setTimeout(() => {
        const first = document.querySelector<HTMLElement>(".v2-hero-slide");
        const anim = first?.getAnimations?.()[0];
        // The first slide starts 1.2 s into its cycle (negative delay): remove that offset.
        const elapsed = anim && typeof anim.currentTime === "number" ? anim.currentTime / 1000 - 1.2 : performance.now() / 1000;
        setLate(elapsed);
      }, 1200);
    };
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("load", go);
    };
  }, []);
  if (late === null) return null;
  return (
    <div data-late style={{ display: "contents", "--late": `${-late}s` } as React.CSSProperties}>
      {children}
    </div>
  );
}
