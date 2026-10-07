import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, FONT_DISPLAY, FONT_LABEL } from "./brand";
import { Grain, Vignette } from "./Grain";
import { LogoReveal } from "./LogoReveal";

// Vertical teaser for Instagram / Facebook (1080 × 1920, ~17 s): the house at nightfall, a few plates
// of recent months, the cave, then the logo and the phone number. Real photos only (nocturne grade).
const ease = Easing.bezier(0.22, 1, 0.36, 1);

type Scene = { plate: string; label: string; title: [string, string]; focal?: string; push?: [number, number] };
const SCENES: Scene[] = [
  { plate: "salle-mur-vins-portrait", label: "Dardilly-le-Bas", title: ["Comme", "Avant"], focal: "50% 30%" },
  { plate: "salle-arche-bar", label: "La salle", title: ["Sous", "l'arche"], focal: "55% 50%" },
  { plate: "plat-poulpe", label: "Cuisine de saison", title: ["La carte", "change"], focal: "50% 45%" },
  { plate: "dessert-moelleux-fruits-rouges", label: "Assiettes des derniers mois", title: ["Et pour", "finir"], focal: "45% 50%", push: [1.18, 1.06] },
  { plate: "detail-niche-chartreuse", label: "La cave", title: ["95 vins", "à la carte"], focal: "50% 50%" },
  { plate: "exterieur-ruelle", label: "La ruelle, à côté de l'église", title: ["Une table", "vous attend"], focal: "50% 40%" },
];
const SCENE = 78; // frames per scene at 30 fps
const T = 14; // cross-fade

function PhotoScene({ s }: { s: Scene }) {
  const frame = useCurrentFrame();
  const [from, to] = s.push ?? [1.06, 1.16];
  const scale = interpolate(frame, [0, SCENE + T], [from, to]);
  const rise = (d: number) => interpolate(frame, [8 + d, 34 + d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  return (
    <AbsoluteFill style={{ background: C.night }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <Img src={staticFile(`plates/${s.plate}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: s.focal }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(11,16,32,0.55) 0%, rgba(11,16,32,0) 30%, rgba(11,16,32,0.35) 55%, rgba(11,16,32,0.95) 100%)" }} />
      <AbsoluteFill style={{ justifyContent: "flex-end", padding: "0 80px 230px" }}>
        <div style={{ fontFamily: FONT_LABEL, fontSize: 26, letterSpacing: "0.32em", textTransform: "uppercase", color: C.gold, opacity: rise(0) }}>{s.label}</div>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 300, fontSize: 190, lineHeight: 0.88, letterSpacing: "-0.02em", color: C.cream, marginTop: 26 }}>
          <div style={{ opacity: rise(4), transform: `translateY(${(1 - rise(4)) * 60}px)` }}>{s.title[0]}</div>
          <div style={{ opacity: rise(10), transform: `translateY(${(1 - rise(10)) * 60}px)`, fontStyle: "italic", color: C.gold }}>{s.title[1]}</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

function Outro() {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [70, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  return (
    <AbsoluteFill>
      <LogoReveal />
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 220, opacity: a }}>
        <div style={{ fontFamily: FONT_LABEL, fontSize: 26, letterSpacing: "0.3em", color: C.gold }}>RÉSERVATIONS</div>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 300, fontSize: 104, color: C.cream, marginTop: 14, fontVariantNumeric: "lining-nums" }}>04 78 66 19 57</div>
        <div style={{ fontFamily: FONT_DISPLAY, fontStyle: "italic", fontSize: 44, color: C.cream, opacity: 0.85, marginTop: 6 }}>
          3 place de l&apos;Église, Dardilly
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

export const REEL_FRAMES = SCENES.length * SCENE + 170 - SCENES.length * T;

export function Reel() {
  return (
    <AbsoluteFill style={{ background: C.night }}>
      <TransitionSeries>
        {SCENES.flatMap((s, i) => [
          <TransitionSeries.Sequence key={s.plate} durationInFrames={SCENE + T}>
            <PhotoScene s={s} />
          </TransitionSeries.Sequence>,
          <TransitionSeries.Transition key={`t${i}`} presentation={fade()} timing={linearTiming({ durationInFrames: T })} />,
        ])}
        <TransitionSeries.Sequence durationInFrames={170}>
          <Outro />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Vignette strength={0.55} />
      <Grain opacity={0.09} />
    </AbsoluteFill>
  );
}
