"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Gsap = (typeof import("gsap"))["gsap"];
type ST = (typeof import("gsap/ScrollTrigger"))["ScrollTrigger"];
type Libs = { gsap: Gsap; ScrollTrigger: ST };

// Site-wide motion, loaded after first paint (GSAP + ScrollTrigger + Lenis are code-split).
// One Lenis smooth scroll for the whole visit (desktop, fine pointer); scroll-driven effects are set
// up again on every page from data attributes:
//   [data-reveal]       rises in once when it enters the screen
//   [data-words]        its [data-w] words light up one by one with the scroll
//   [data-parallax="k"] drifts vertically at k × the scroll speed of its section
//   [data-arch]         pinned: the arch-shaped window opens to full screen
//   [data-rail]         desktop: pinned horizontal gallery driven by the vertical scroll
//   [data-count]        counts up to its number once
// Pinned elements are always inner wrappers, never a node whose parent React manages, so client-side
// navigation can unmount any page. Nothing runs with prefers-reduced-motion.
export function V2Motion() {
  const pathname = usePathname();
  const [libs, setLibs] = useState<Libs | null>(null);

  // Libraries and Lenis, once.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    let destroy = () => {};
    (async () => {
      const [{ gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger"), import("lenis")]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      document.documentElement.classList.add("v2-motion");
      if (window.matchMedia("(pointer: fine)").matches) {
        const lenis = new Lenis({ autoRaf: false, lerp: 0.1, smoothWheel: true });
        const tick = (t: number) => lenis.raf(t * 1000);
        document.documentElement.classList.add("lenis");
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);
        destroy = () => {
          gsap.ticker.remove(tick);
          lenis.destroy();
          document.documentElement.classList.remove("lenis");
        };
      }
      setLibs({ gsap, ScrollTrigger });
    })();
    return () => {
      cancelled = true;
      destroy();
      document.documentElement.classList.remove("v2-motion");
    };
  }, []);

  // Scroll-driven effects, per page.
  useEffect(() => {
    if (!libs) return;
    const { gsap, ScrollTrigger } = libs;
    let cancelled = false;
    const ctx = gsap.context(() => {});
    // Small steps with a yield between them, so no single task blocks input.
    const idle = () =>
      new Promise<void>((r) => (typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(() => r(), { timeout: 300 }) : setTimeout(r, 16)));
    const step = async (fn: () => void) => {
      await idle();
      if (!cancelled) ctx.add(fn);
    };

    (async () => {
      await new Promise((r) => requestAnimationFrame(() => r(null)));
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
      document.fonts?.ready.then(() => {
        if (!cancelled) ScrollTrigger.refresh();
      });
    })();

    return () => {
      cancelled = true;
      ctx.revert();
      document.querySelector("[data-rail][data-pinned]")?.removeAttribute("data-pinned");
    };
  }, [libs, pathname]);

  return null;
}
