"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { flushSync } from "react-dom";
import "./lightbox.css";

export type SlideMeta = { caption: string; note?: string };

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type SavedStyle = { overflow: string; gutter: string };

/** Locks the page behind the modal (a modal dialog does not stop the page from scrolling). */
function lockScroll(): SavedStyle {
  const style = document.documentElement.style;
  const saved = { overflow: style.overflow, gutter: style.scrollbarGutter };
  if (window.innerWidth > document.documentElement.clientWidth) style.scrollbarGutter = "stable";
  style.overflow = "hidden";
  return saved;
}
function unlockScroll(saved: SavedStyle) {
  const style = document.documentElement.style;
  style.overflow = saved.overflow;
  style.scrollbarGutter = saved.gutter;
}

function photoIn(dialog: HTMLDialogElement | null, i: number) {
  return dialog?.querySelector<HTMLElement>(`[data-slide="${i}"] [data-lb-photo]`) ?? null;
}

// Accessible lightbox for the Galerie: native modal <dialog>, visible Précédent / Suivant / Fermer
// buttons, arrow keys, Esc, swipe as an extra. Opens with a zoom from the thumbnail (transform and
// opacity only, skipped with reduced motion). Thumbnails are server-rendered <button>s carrying
// data-lightbox-index; the large photos arrive pre-rendered in `slides`.
export function Lightbox({ slides, meta, children }: { slides: ReactNode[]; meta: SlideMeta[]; children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const indexRef = useRef(0);
  const savedStyle = useRef<SavedStyle | null>(null);
  const swipe = useRef<{ x: number; y: number; id: number } | null>(null);
  const [index, setIndex] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const total = slides.length;

  const open = useCallback((i: number, from: HTMLElement) => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    indexRef.current = i;
    flushSync(() => {
      setIndex(i);
      setAnnouncement("");
    });
    savedStyle.current = lockScroll();
    dialog.showModal();
    dialog.focus();

    // Zoom from the thumbnail: the large photo starts at the thumbnail's place and size.
    const target = photoIn(dialog, i);
    if (!target || reduceMotion()) return;
    const a = from.getBoundingClientRect();
    const b = target.getBoundingClientRect();
    if (!a.width || !b.width) return;
    const dx = a.left + a.width / 2 - (b.left + b.width / 2);
    const dy = a.top + a.height / 2 - (b.top + b.height / 2);
    target.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(${a.width / b.width})`, opacity: 0.5 },
        { transform: "none", opacity: 1 },
      ],
      { duration: 420, easing: EASE },
    );
  }, []);

  const go = useCallback(
    (delta: number) => {
      const dialog = dialogRef.current;
      const next = (indexRef.current + delta + total) % total;
      indexRef.current = next;
      flushSync(() => {
        setIndex(next);
        setAnnouncement(`Photo ${next + 1} sur ${total}. ${meta[next]?.caption ?? ""}`);
      });
      // The new photo slides in a little from the side it comes from.
      if (reduceMotion()) return;
      photoIn(dialog, next)?.animate(
        [
          { transform: `translateX(${Math.sign(delta) * 24}px)`, opacity: 0 },
          { transform: "none", opacity: 1 },
        ],
        { duration: 260, easing: EASE },
      );
    },
    [meta, total],
  );

  // Thumbnails are server-rendered: listen to their clicks (Enter and Space included) by delegation.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onClick = (event: MouseEvent) => {
      const button = (event.target as Element | null)?.closest<HTMLElement>("[data-lightbox-index]");
      if (!button || !root.contains(button)) return;
      open(Number(button.dataset.lightboxIndex), button);
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, [open]);

  // Leaving the page with the lightbox open (client navigation) must not keep the page locked.
  useEffect(
    () => () => {
      if (savedStyle.current) unlockScroll(savedStyle.current);
    },
    [],
  );

  const onClose = () => {
    if (savedStyle.current) unlockScroll(savedStyle.current);
    savedStyle.current = null;
    // Back to the thumbnail of the photo seen last (the page scrolls to it if needed).
    rootRef.current?.querySelector<HTMLElement>(`[data-lightbox-index="${indexRef.current}"]`)?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === "ArrowRight") go(1);
    else if (event.key === "ArrowLeft") go(-1);
    else if (event.key === "Home") go(-indexRef.current);
    else if (event.key === "End") go(total - 1 - indexRef.current);
    else return;
    event.preventDefault();
  };

  const current = meta[index];
  const stateOf = (i: number) =>
    i === index ? "current" : i === (index + 1) % total || i === (index - 1 + total) % total ? "near" : "off";

  return (
    <div ref={rootRef}>
      {children}
      <dialog
        ref={dialogRef}
        className="lb on-navy"
        aria-labelledby="lb-count"
        aria-describedby="lb-caption"
        tabIndex={-1}
        onClose={onClose}
        onKeyDown={onKeyDown}
      >
        <div className="lb__top">
          <p id="lb-count" className="tnum text-[1.0625rem] text-on-navy-soft">
            Photo {index + 1} sur {total}
          </p>
          <button type="button" className="btn btn-line" onClick={() => dialogRef.current?.close()}>
            Fermer
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div
          className="lb__stage"
          onPointerDown={(e) => {
            if (e.pointerType !== "mouse") swipe.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
          }}
          onPointerUp={(e) => {
            const start = swipe.current;
            swipe.current = null;
            if (!start || start.id !== e.pointerId) return;
            const dx = e.clientX - start.x;
            const dy = e.clientY - start.y;
            if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.2) go(dx < 0 ? 1 : -1);
          }}
          onPointerCancel={() => {
            swipe.current = null;
          }}
        >
          {slides.map((slide, i) => (
            <div key={i} className="lb__slide" data-slide={i} data-state={stateOf(i)}>
              {slide}
            </div>
          ))}
        </div>

        <div className="lb__bottom">
          <button type="button" className="lb__prev btn btn-line" onClick={() => go(-1)}>
            Précédent
          </button>
          <div id="lb-caption" className="lb__caption">
            <p>{current?.caption}</p>
            {current?.note ? <p className="text-[1rem] text-on-navy-soft">{current.note}</p> : null}
          </div>
          <button type="button" className="lb__next btn btn-line" onClick={() => go(1)}>
            Suivant
          </button>
        </div>

        {/* Announces the change after Précédent / Suivant (on opening, the dialog's name and description are read). */}
        <p className="sr-only" aria-live="polite">
          {announcement}
        </p>
      </dialog>
    </div>
  );
}
