import { Photo } from "@/components/media/Photo";

// Opening of every inner page in V2 « Nocturne »: one of the owner's photos full bleed (nocturne
// grade), the page title set very large, a short line, and the page's own actions. In print only the
// title and the line remain, black on white.
export function PageHero({
  photo,
  alt,
  focal = [0.5, 0.5],
  label,
  title,
  titleId = "page-titre",
  intro,
  children,
  short = false,
  titleClassName = "",
  caption,
}: {
  photo: string;
  alt: string;
  focal?: [number, number];
  label?: React.ReactNode;
  title: React.ReactNode;
  titleId?: string;
  intro?: React.ReactNode;
  children?: React.ReactNode;
  /** a lower hero for pages where the content must come quickly (booking) */
  short?: boolean;
  titleClassName?: string;
  /** small credit line for the photo (e.g. a dish that is no longer on the carte) */
  caption?: string;
}) {
  return (
    <section
      aria-labelledby={titleId}
      className={`v2-grain relative flex flex-col justify-end overflow-hidden print:min-h-0 print:overflow-visible ${
        short ? "min-h-[58svh] lg:min-h-[64svh]" : "min-h-[72svh] lg:min-h-[86svh]"
      }`}
    >
      <div className="no-print absolute inset-0" data-parallax="0.22">
        <Photo id={photo} alt={alt} sizes="100vw" priority focal={focal} className="!absolute inset-0 h-full !aspect-auto" />
      </div>
      <div
        aria-hidden="true"
        className="no-print absolute inset-0 bg-[linear-gradient(180deg,rgba(11,16,32,0.7)_0%,rgba(11,16,32,0.15)_30%,rgba(11,16,32,0.6)_60%,rgba(11,16,32,0.97)_100%)] lg:bg-[linear-gradient(180deg,rgba(11,16,32,0.65)_0%,rgba(11,16,32,0.05)_30%,rgba(11,16,32,0.45)_62%,rgba(11,16,32,0.96)_100%),linear-gradient(90deg,rgba(11,16,32,0.6)_0%,rgba(11,16,32,0)_55%)]"
      />
      <div className="relative z-[3] mx-auto w-full max-w-[96rem] px-5 pb-10 pt-32 sm:px-10 sm:pb-14 print:p-0">
        {label ? <p className="v2-label v2-hero-in print:!text-black">{label}</p> : null}
        <h1
          id={titleId}
          className={`v2-display v2-hero-in mt-5 text-[clamp(4rem,15vw,12.5rem)] print:mt-0 print:text-[28pt] print:!text-black ${titleClassName}`}
          style={{ "--d": "0.08s" } as React.CSSProperties}
        >
          {title}
        </h1>
        {intro ? (
          <div className="v2-hero-in mt-7 max-w-[38rem] text-[clamp(1.125rem,1rem+0.5vw,1.375rem)] leading-relaxed text-cream/90 print:mt-1 print:text-[10pt] print:!text-black" style={{ "--d": "0.18s" } as React.CSSProperties}>
            {intro}
          </div>
        ) : null}
        {children ? (
          <div className="v2-hero-in mt-8" style={{ "--d": "0.28s" } as React.CSSProperties}>
            {children}
          </div>
        ) : null}
      </div>
      {caption ? <p className="no-print absolute bottom-4 right-5 z-[3] text-[0.875rem] text-cream/60 sm:right-10">{caption}</p> : null}
    </section>
  );
}
