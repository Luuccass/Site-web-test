import Link from "next/link";
import type { CSSProperties } from "react";
import { Photo } from "@/components/media/Photo";
import { AlcoholNotice } from "@/components/ui/AlcoholNotice";
import { buildGallery, FRAME_FOCAL, FRAME_VALUE, nativeRatio, type GalleryRow } from "./layout";
import { Lightbox, type SlideMeta } from "./Lightbox";

// Editorial grid: rows of 2 or 3 photos whose widths follow their frames (4:5, 1:1, 3:2), so every
// photo in a row has the same height and rows of 2 and 3 alternate in height. On phones a row of
// 3 becomes one full-width photo over a pair; a row of 2 stacks.

const ROW_MAX_HEIGHT_REM = 34; // a row never gets taller than this on wide screens
const CONTENT_MAX_PX = 1248; // 84rem container minus its 3rem side padding

function rowLayout(row: GalleryRow) {
  const ratios = row.map((item) => FRAME_VALUE[item.frame]);
  const sum = ratios.reduce((a, b) => a + b, 0);
  const track = (r: number) => `minmax(0,${r.toFixed(3)}fr)`;
  const mobileRest = ratios.slice(1).reduce((a, b) => a + b, 0);
  const style = {
    "--cols": ratios.map(track).join(" "),
    "--cols-m": row.length >= 3 ? ratios.slice(1).map(track).join(" ") : "minmax(0,1fr)",
    maxWidth: `calc(${sum.toFixed(3)} * ${ROW_MAX_HEIGHT_REM}rem + ${row.length - 1}rem)`,
  } as CSSProperties;
  const rowPx = Math.min(CONTENT_MAX_PX, sum * ROW_MAX_HEIGHT_REM * 16 + (row.length - 1) * 16);
  const sizes = row.map((_, i) => {
    const share = ratios[i] / sum;
    const mobile = row.length >= 3 && i > 0 ? Math.round((ratios[i] / mobileRest) * 100) : 100;
    return `(min-width: 1344px) ${Math.round(share * rowPx)}px, (min-width: 640px) ${Math.round(share * 94)}vw, ${mobile}vw`;
  });
  return { style, sizes };
}

export function Gallery() {
  const { sections, items } = buildGallery();

  // Large versions for the lightbox, uncropped at their own ratio, rendered here on the server.
  const slides = items.map((item) => {
    const r = nativeRatio(item.id);
    return (
      <div key={item.id} data-lb-photo className="lb__photo" style={{ "--r": r.toFixed(4) } as CSSProperties}>
        <Photo id={item.id} alt={item.alt} sizes={`min(100vw, calc((100vh - 11rem) * ${r.toFixed(3)}))`} focal={item.focal} />
      </div>
    );
  });
  const meta: SlideMeta[] = items.map((item) => ({
    caption: item.caption,
    note: item.group === "assiettes" ? "Assiette des derniers mois" : undefined,
  }));

  return (
    <Lightbox slides={slides} meta={meta}>
      {sections.map((section) => {
        const onNavy = section.id === "maison";
        const soft = onNavy ? "text-on-navy-soft" : "text-ink-soft";
        const headingId = `galerie-${section.id}`;
        return (
          <section key={section.id} aria-labelledby={headingId} className={onNavy ? "on-navy bg-navy text-on-navy" : undefined}>
            <div className="mx-auto max-w-[84rem] px-4 py-16 sm:px-8 sm:py-24 lg:px-12">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-end lg:gap-16">
                <h2 id={headingId} className="text-[length:var(--text-h2)]">
                  {section.title}
                </h2>
                {section.id === "assiettes" ? (
                  <p className={`measure ${soft}`}>
                    {"La carte suit les saisons : ces assiettes n'y sont peut-être plus. "}
                    <Link href="/la-carte/" className="underline">
                      La carte du moment
                    </Link>
                  </p>
                ) : (
                  <p className={`measure ${soft}`}>La ruelle, la salle sous l&apos;arche, le mur des vins et la cave.</p>
                )}
              </div>

              <div className="mt-10 space-y-8 sm:mt-14 sm:space-y-10">
                {section.rows.map((row) => {
                  const { style, sizes } = rowLayout(row);
                  return (
                    <div
                      key={row[0].id}
                      className="mx-auto grid gap-x-2 gap-y-8 [grid-template-columns:var(--cols-m)] sm:gap-x-3 sm:[grid-template-columns:var(--cols)] lg:gap-x-4"
                      style={style}
                    >
                      {row.map((item, i) => (
                        <figure key={item.id} className={row.length >= 3 && i === 0 ? "max-sm:col-span-full" : undefined}>
                          <div className="group relative">
                            <Photo
                              id={item.id}
                              alt=""
                              sizes={sizes[i]}
                              ratio={FRAME_VALUE[item.frame]}
                              focal={FRAME_FOCAL[item.id] ?? item.focal}
                              imgClassName="transition-transform duration-700 ease-out-soft group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                            />
                            <button
                              type="button"
                              data-lightbox-index={item.index}
                              aria-haspopup="dialog"
                              className="absolute inset-0 cursor-zoom-in"
                            >
                              <span className="sr-only">{`Agrandir la photo : ${item.alt}`}</span>
                            </button>
                          </div>
                          <figcaption className={`mt-2.5 text-[1rem] leading-snug ${soft}`}>{item.caption}</figcaption>
                        </figure>
                      ))}
                    </div>
                  );
                })}
              </div>

              {onNavy ? <AlcoholNotice className={`mt-12 ${soft}`} /> : null}
            </div>
          </section>
        );
      })}
    </Lightbox>
  );
}
