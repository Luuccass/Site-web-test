"use client";

import { useState, useSyncExternalStore } from "react";

// OpenStreetMap, loaded only when the visitor asks for it: until then the panel is drawn locally (address
// plaque and a pin, no fake streets) and the page makes no request to a third party.
//
// With verified coordinates (`point`), the button inserts the OSM embed with its marker and the ODbL
// attribution. Without them, the button is a link to the OSM search for the address, in a new tab: an
// embed centred on a guessed position could point visitors to the wrong lane.

type Point = { lat: number; lon: number };

const noop = () => () => {};
const useHydrated = () =>
  useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

const OSM = "https://www.openstreetmap.org";

// Stable callback ref: moves focus to the map once, when it is inserted after the click.
const focusOnMount = (el: HTMLElement | null) => el?.focus();

function embedUrl({ lat, lon }: Point) {
  const dLat = 0.0022;
  const dLon = 0.0034;
  const bbox = [lon - dLon, lat - dLat, lon + dLon, lat + dLat].map((v) => v.toFixed(5)).join(",");
  return `${OSM}/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat.toFixed(6)},${lon.toFixed(6)}`;
}

export function MapClickToLoad({
  point,
  query,
  title,
  street,
  locality,
  note,
}: {
  point: Point | null;
  /** Address searched on openstreetmap.org when no verified point is set. */
  query: string;
  /** Accessible name of the map (iframe title). */
  title: string;
  street: string;
  locality: string;
  note?: string;
}) {
  const hydrated = useHydrated();
  const [loaded, setLoaded] = useState(false);
  const searchUrl = `${OSM}/search?query=${encodeURIComponent(query)}`;
  const fullUrl = point ? `${OSM}/?mlat=${point.lat}&mlon=${point.lon}#map=18/${point.lat}/${point.lon}` : searchUrl;
  const frame = "aspect-[4/3] w-full sm:aspect-[3/2]";

  if (point && loaded) {
    return (
      <figure>
        <iframe
          src={embedUrl(point)}
          title={title}
          className={`${frame} block border border-line`}
          ref={focusOnMount}
          referrerPolicy="strict-origin-when-cross-origin"
        />
        <figcaption className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[1rem] text-ink-soft">
          <span>
            ©{" "}
            <a href={`${OSM}/copyright`} className="underline" rel="noopener">
              les contributeurs d&apos;OpenStreetMap
            </a>
          </span>
          <a href={fullUrl} className="underline" rel="noopener" target="_blank">
            Agrandir le plan<span className="sr-only"> (nouvel onglet)</span>
          </a>
        </figcaption>
      </figure>
    );
  }

  const opensTab = !point || !hydrated;
  return (
    <div className={`${frame} flex flex-col items-center justify-center gap-5 border border-line px-6 py-10 text-center`}>
      <svg aria-hidden="true" viewBox="0 0 32 44" className="h-11 w-8 text-navy" fill="currentColor">
        <path d="M16 0C7.2 0 0 7 0 15.7 0 27.5 16 44 16 44s16-16.5 16-28.3C32 7 24.8 0 16 0Zm0 22a6.3 6.3 0 1 1 0-12.6A6.3 6.3 0 0 1 16 22Z" />
      </svg>
      <p className="on-navy bg-navy px-5 py-3 font-[family-name:var(--font-plaque)] text-[0.9375rem] font-medium uppercase leading-snug tracking-[0.12em] text-on-navy">
        {street}
        <br />
        {locality}
      </p>
      {note ? <p className="measure text-ink-soft">{note}</p> : null}
      {opensTab ? (
        <a href={point ? fullUrl : searchUrl} target="_blank" rel="noopener" className="btn btn-line">
          {point ? "Afficher la carte interactive" : "Voir le plan sur OpenStreetMap"}
          <span className="sr-only">{point ? " (OpenStreetMap, nouvel onglet)" : " (nouvel onglet)"}</span>
        </a>
      ) : (
        <button type="button" className="btn btn-line" onClick={() => setLoaded(true)}>
          Afficher la carte interactive
        </button>
      )}
      <p className="max-w-[28rem] text-[1rem] text-ink-soft">
        {opensTab
          ? "Le plan s'ouvre sur openstreetmap.org, dans un nouvel onglet."
          : "Carte OpenStreetMap : elle ne se charge qu'après votre clic."}
      </p>
    </div>
  );
}
