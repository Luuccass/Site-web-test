import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { StickyBar } from "@/components/layout/StickyBar";
import { MotionObserver } from "@/components/motion/MotionObserver";
import { StatusUpdater } from "@/components/status/StatusUpdater";
import { Cursor } from "@/components/v2/Cursor";
import { FooterV2, Intro } from "@/components/v2/sections";
import { V2Header } from "@/components/v2/V2Header";
import { V2Motion } from "@/components/v2/V2Motion";
import { directionsUrl, site, statusData } from "@/lib/data";
import "./globals.css";
import "@/components/v2/v2.css";

const spectral = localFont({
  src: [
    { path: "../fonts/Spectral-Light.woff2", weight: "300", style: "normal" },
    { path: "../fonts/Spectral-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Spectral-Italic.woff2", weight: "400", style: "italic" },
    { path: "../fonts/Spectral-Medium.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-spectral",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

// V2 « Nocturne » display face (variable, latin): giant headlines only.
const cormorant = localFont({
  src: [
    { path: "../fonts/CormorantGaramond-Variable.woff2", weight: "300 700", style: "normal" },
    { path: "../fonts/CormorantGaramond-Italic-Variable.woff2", weight: "300 700", style: "italic" },
  ],
  variable: "--font-cormorant",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

const montserrat = localFont({
  src: [{ path: "../fonts/Montserrat-Medium-caps.woff2", weight: "500", style: "normal" }],
  variable: "--font-montserrat",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Restaurant Comme Avant à Dardilly | Cuisine française de saison",
    template: "%s | Restaurant Comme Avant, Dardilly",
  },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Restaurant Comme Avant, Dardilly",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "La salle du restaurant Comme Avant à Dardilly" }],
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/favicon-32.png", sizes: "32x32" }] },
};

export const viewport: Viewport = {
  themeColor: "#0b1020",
  viewportFit: "cover",
};

const INTRO = `try{if(!sessionStorage.getItem("v2-intro")&&!matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.classList.add("v2-intro-on");sessionStorage.setItem("v2-intro","1")}}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${spectral.variable} ${cormorant.variable} ${montserrat.variable}`} suppressHydrationWarning>
      <head>
        {/* Enables the scroll-triggered door and wall motions only when JS runs (no-JS: everything visible). */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js-doors','js-cells')" }} />
        {/* « La porte s'ouvre »: the door intro plays on the first page of a visit only, never with reduced motion. */}
        <script dangerouslySetInnerHTML={{ __html: INTRO }} />
      </head>
      <body>
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:px-4 focus:py-3 focus:text-ink"
        >
          Aller au contenu
        </a>
        <Intro />
        <V2Header phone={site.phone} />
        <main id="contenu" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <FooterV2 />
        <StickyBar phone={site.phone} directionsUrl={directionsUrl} />
        <StatusUpdater data={statusData} />
        <MotionObserver />
        <Cursor />
        <V2Motion />
      </body>
    </html>
  );
}
