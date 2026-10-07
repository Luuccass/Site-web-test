"use client";

import { useEffect } from "react";

// M2 « Entrer chez Comme Avant » + M8 smooth scroll, desktop only.
// GSAP, ScrollTrigger and Lenis are fetched with import() after mount, and only when this query
// matches (keep it identical to the media query in enter-story.css). Otherwise nothing is downloaded
// and the CSS keeps the stacked layout with the M2m doors.
const STORY_QUERY = "(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

type Gsap = (typeof import("gsap"))["gsap"];
type ScrollTriggerStatic = (typeof import("gsap/ScrollTrigger"))["ScrollTrigger"];
type LenisClass = (typeof import("lenis"))["default"];

export function StoryMotion({ targetId }: { targetId: string }) {
  useEffect(() => {
    const root = document.getElementById(targetId);
    if (!root) return;
    const mq = window.matchMedia(STORY_QUERY);
    let disposed = false;
    let loading = false;
    let revert: (() => void) | undefined;

    const load = async () => {
      if (disposed || loading || revert || !mq.matches) return;
      loading = true;
      try {
        const [{ gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
          import("lenis"),
        ]);
        if (disposed) return;
        gsap.registerPlugin(ScrollTrigger);
        const mm = gsap.matchMedia();
        mm.add(STORY_QUERY, () => setup(root, gsap, ScrollTrigger, Lenis));
        revert = () => mm.revert();
        document.fonts?.ready.then(() => {
          if (!disposed) ScrollTrigger.refresh();
        });
      } catch {
        // Could not load the libraries: fall back to the stacked layout (photos visible, M2m doors).
        root.setAttribute("data-static", "");
      } finally {
        loading = false;
      }
    };

    load();
    mq.addEventListener("change", load);
    return () => {
      disposed = true;
      mq.removeEventListener("change", load);
      revert?.();
    };
  }, [targetId]);

  return null;
}

/** Runs inside gsap.matchMedia(): every tween and ScrollTrigger made here is reverted with it. */
function setup(root: HTMLElement, gsap: Gsap, ScrollTrigger: ScrollTriggerStatic, Lenis: LenisClass) {
  const html = document.documentElement;
  const grid = root.querySelector<HTMLElement>("[data-story-grid]");
  const steps = gsap.utils.toArray<HTMLElement>("[data-step]", root);
  const part = (name: string, i: number) => root.querySelector<HTMLElement>(`[data-${name}="${i}"]`);
  if (!grid || steps.length === 0) return;

  // M8: gentle smooth wheel scrolling, driven by GSAP's ticker so ScrollTrigger stays in sync.
  const lenis = new Lenis({ autoRaf: false, lerp: 0.12, smoothWheel: true, syncTouch: false });
  html.classList.add("lenis");
  lenis.on("scroll", ScrollTrigger.update);
  const raf = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);

  const ease = "power1.inOut";

  // First photo: the doors open on the ruelle while the stage slides into place.
  const l0 = part("leaf-l", 0);
  const r0 = part("leaf-r", 0);
  const z0 = part("zoom", 0);
  if (l0 && r0 && z0) {
    gsap.set([l0, r0], { visibility: "visible", xPercent: 0 });
    gsap
      .timeline({ scrollTrigger: { trigger: grid, start: "top 70%", end: "top top", scrub: 0.5 } })
      .to(l0, { xPercent: -101, ease }, 0)
      .to(r0, { xPercent: 101, ease }, 0)
      .fromTo(z0, { scale: 1.08 }, { scale: 1, ease }, 0);
  }

  // Next photos: as each step's text arrives, its own pair of leaves closes over the previous photo,
  // the photo behind changes, then the leaves part again. Each pair belongs to one step only.
  steps.slice(1).forEach((step, k) => {
    const i = k + 1;
    const left = part("leaf-l", i);
    const right = part("leaf-r", i);
    const layer = part("layer", i);
    const zoom = part("zoom", i);
    if (!left || !right || !layer || !zoom) return;
    gsap.set(left, { visibility: "visible", xPercent: -101 });
    gsap.set(right, { visibility: "visible", xPercent: 101 });
    gsap
      .timeline({ scrollTrigger: { trigger: step, start: "top 75%", end: "top 25%", scrub: 0.5 } })
      .to(left, { xPercent: 0, duration: 0.5, ease }, 0)
      .to(right, { xPercent: 0, duration: 0.5, ease }, 0)
      .set(layer, { visibility: "visible" }, 0.5)
      .fromTo(zoom, { scale: 1.08 }, { scale: 1, duration: 0.5, ease }, 0.5)
      .to(left, { xPercent: -101, duration: 0.5, ease }, 0.5)
      .to(right, { xPercent: 101, duration: 0.5, ease }, 0.5);
  });

  return () => {
    gsap.ticker.remove(raf);
    gsap.ticker.lagSmoothing(500, 33);
    lenis.destroy();
    html.classList.remove("lenis");
  };
}
