import type { Metadata } from "next";
import { InlineScript } from "@/components/status/InlineScript";
import { Cursor } from "@/components/v2/Cursor";
import { ArchReveal, CarteV2, CaveV2, FooterV2, GalleryRail, Hero, Intro, Manifesto, Marquee, RatingBand, ReserveV2 } from "@/components/v2/sections";
import { V2Header } from "@/components/v2/V2Header";
import { V2Motion } from "@/components/v2/V2Motion";
import { site } from "@/lib/data";
import "@/components/v2/v2.css";

// Preview of the V2 « Nocturne » home, for the owner's validation. Not indexed, not in the sitemap.
export const metadata: Metadata = {
  title: "Aperçu V2",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

// The door intro plays once per session, never with reduced motion (class set before first paint).
const INTRO = `try{if(!sessionStorage.getItem("v2-intro")&&!matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.classList.add("v2-intro-on");sessionStorage.setItem("v2-intro","1")}}catch(e){}`;

export default function Apercu() {
  return (
    <div className="v2">
      <InlineScript html={INTRO} />
      <Intro />
      <V2Header phone={site.phone} />
      <Hero />
      <Marquee />
      <Manifesto />
      <ArchReveal />
      <CarteV2 />
      <CaveV2 />
      <GalleryRail />
      <RatingBand />
      <ReserveV2 />
      <FooterV2 />
      <Cursor />
      <V2Motion />
    </div>
  );
}
