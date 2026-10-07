"use client";

import { useEffect } from "react";

// Motion for the V2 home, loaded after first paint (GSAP + ScrollTrigger + Lenis are code-split).
// Reads data attributes set by the sections:
//   [data-reveal]       rises in once when it enters the screen
//   [data-words]        its [data-w] words light up one by one with the scroll
//   [data-parallax="k"] drifts vertically at k × the scroll speed of its section
//   [data-arch]         pinned: the arch-shaped window opens to full screen
//   [data-rail]         desktop: pinned horizontal gallery driven by the vertical scroll
//   [data-count]        counts up to its number once
// Nothing runs with prefers-reduced-motion: the page is already complete in its resting state.
export function V2Motion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cleanup = () => {};
    let cancelled = false;

    (async () => {
      const [{ gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger"), import("lenis")]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      document.documentElement.classList.add("v2-motion");

      // Setup is split into small steps with a yield between them, so no single task blocks input.
      const idle = () =>
        new Promise<void>((r) => (typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(() => r(), { timeout: 300 }) : setTimeout(r, 16)));
      await idle();
      if (cancelled) return;
      const fine = window.matchMedia("(pointer: fine)").matches;
      const lenis = fine ? new Lenis({ autoRaf: false, lerp: 0.1, smoothWheel: true }) : null;
      const tick = (t: number) => lenis?.raf(t * 1000);
      if (lenis) {
        document.documentElement.classList.add("lenis");
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);
      }

      const ctx = gsap.context(() => {});
      cleanup = () => {
        ctx.revert();
        if (lenis) {
          gsap.ticker.remove(tick);
          lenis.destroy();
          document.documentElement.classList.remove("lenis");
        }
        document.documentElement.classList.remove("v2-motion");
      };
      const step = async (fn: () => void) => {
        await idle();
        if (!cancelled) ctx.add(fn);
      };
      await step(() => {
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
          gsap.from(el, { y: 60, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
        });
      });

      await step(() => {
        gsap.utils.toArray<HTMLElement>("[data-words]").forEach((el) => {
          const words = Array.from(el.querySelectorAll<HTMLElement>("[data-w]"));
          words.forEach((w) => w.style.setProperty("--o", "0.4")); // 0.4: unlit words stay readable (3:1 at this size)
          ScrollTrigger.create({
            trigger: el,
            start: "top 80%",
            end: "bottom 45%",
            scrub: true,
            onUpdate: (st) => {
              const lit = st.progress * words.length;
              words.forEach((w, i) => w.style.setProperty("--o", String(Math.min(1, Math.max(0.4, lit - i + 0.4)))));
            },
          });
        });
      });

      await step(() => {
        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
          const k = parseFloat(el.dataset.parallax || "0");
          const host = el.closest("section") ?? el;
          gsap.fromTo(el, { yPercent: -k * 18 }, { yPercent: k * 18, ease: "none", scrollTrigger: { trigger: host, start: "top bottom", end: "bottom top", scrub: true } });
        });
      });

      await step(() => {
        gsap.utils.toArray<HTMLElement>("[data-arch]").forEach((section) => {
          const stage = section.querySelector<HTMLElement>("[data-arch-stage]");
          const frame = section.querySelector<HTMLElement>("[data-arch-frame]");
          const text = section.querySelector<HTMLElement>("[data-arch-text]");
          if (!stage || !frame) return;
          const tl = gsap.timeline({ scrollTrigger: { trigger: stage, start: "top top", end: "+=110%", pin: true, scrub: 0.6 } });
          tl.fromTo(
            frame,
            { clipPath: "inset(16% 30% 8% 30% round 999px 999px 0px 0px)" },
            { clipPath: "inset(0% 0% 0% 0% round 0px 0px 0px 0px)", ease: "power2.inOut", duration: 1 },
          );
          tl.fromTo(frame.querySelector("img"), { scale: 1.25 }, { scale: 1, ease: "power2.out", duration: 1 }, 0);
          if (text) tl.from(text, { y: 50, opacity: 0, duration: 0.35, ease: "power2.out" }, 0.7);
        });
      });

      await step(() => {
        const rail = document.querySelector<HTMLElement>("[data-rail]");
        const track = rail?.querySelector<HTMLElement>("[data-rail-track]");
        const railSection = document.querySelector<HTMLElement>("[data-rail-section]");
        if (rail && track && railSection && window.matchMedia("(min-width: 1024px)").matches) {
          rail.setAttribute("data-pinned", "");
          const distance = () => Math.max(0, track.scrollWidth - rail.clientWidth);
          gsap.to(track, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: { trigger: railSection, start: "top top", end: () => `+=${distance()}`, pin: true, scrub: 0.6, invalidateOnRefresh: true },
          });
        }
      });

      await step(() => {
        gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
          const to = parseInt(el.dataset.count || "0", 10);
          const obj = { v: 0 };
          gsap.to(obj, {
            v: to,
            duration: 1.8,
            ease: "power3.out",
            onUpdate: () => {
              el.textContent = String(Math.round(obj.v));
            },
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          });
        });
      });
      if (cancelled) return;
      ScrollTrigger.refresh();

      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return null;
}
