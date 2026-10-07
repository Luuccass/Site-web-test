import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT_DISPLAY, FONT_LABEL } from "./brand";
import { Grain, Vignette } from "./Grain";
import logo from "./logo-data.json";

// « Comme Avant » logo reveal: the rosette draws itself in gold, the letters rise, a gold light sweeps
// across, then the tagline. Made from the restaurant's own stacked logo (vector paths).
const ease = Easing.bezier(0.22, 1, 0.36, 1);

function draw(frame: number, start: number, end: number) {
  return interpolate(frame, [start, end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
}
function fade(frame: number, start: number, end: number) {
  return interpolate(frame, [start, end], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
}

export function LogoReveal() {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const portrait = height > width;
  const [vx, vy, vw, vh] = logo.viewBox;
  const ringLen = 2 * Math.PI * logo.ring.r;
  const outerLen = 2 * Math.PI * logo.outer.r;
  const sq = spring({ frame: frame - 34, fps, config: { damping: 14, mass: 0.6 } });
  const sweep = interpolate(frame, [92, 128], [-0.4, 1.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.05]);
  const glow = fade(frame, 0, 40);
  const logoWidth = portrait ? width * 0.78 : width * 0.42;

  return (
    <AbsoluteFill style={{ background: C.night }}>
      <AbsoluteFill style={{ background: `radial-gradient(60% 50% at 50% 46%, rgba(201,168,106,${0.16 * glow}) 0%, rgba(23,33,59,${0.6 * glow}) 45%, ${C.night} 85%)` }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `scale(${zoom})` }}>
        <svg viewBox={`${vx} ${vy} ${vw} ${vh}`} width={logoWidth} style={{ overflow: "visible" }}>
          <defs>
            <linearGradient id="sweep" x1="0" x2="1" y1="0" y2="0.25">
              <stop offset={Math.max(0, sweep - 0.18)} stopColor={C.cream} />
              <stop offset={Math.max(0, Math.min(1, sweep))} stopColor="#fff6dc" />
              <stop offset={Math.min(1, sweep + 0.18)} stopColor={C.cream} />
            </linearGradient>
          </defs>
          {/* Rosette: outer hairline, the ring, the scalloped crown, four squares, four leaves. */}
          <circle cx={logo.outer.cx} cy={logo.outer.cy} r={logo.outer.r} fill="none" stroke={C.gold} strokeWidth={logo.outer.w} opacity={0.7} strokeDasharray={outerLen} strokeDashoffset={outerLen * draw(frame, 6, 40)} transform={`rotate(-90 ${logo.outer.cx} ${logo.outer.cy})`} />
          <circle cx={logo.ring.cx} cy={logo.ring.cy} r={logo.ring.r} fill="none" stroke={C.gold} strokeWidth={logo.ring.w} strokeDasharray={ringLen} strokeDashoffset={ringLen * draw(frame, 10, 46)} transform={`rotate(-90 ${logo.ring.cx} ${logo.ring.cy})`} />
          <path d={logo.wavy} fill="none" stroke={C.gold} strokeWidth={4.3} pathLength={1} strokeDasharray={1} strokeDashoffset={draw(frame, 16, 58)} opacity={0.9} />
          {logo.squares.map(([x, y], i) => (
            <rect key={i} x={x} y={y} width={13.6} height={13.6} rx={4.8} fill={C.gold} style={{ transformOrigin: `${x + 6.8}px ${y + 6.8}px`, transform: `scale(${sq})` }} />
          ))}
          {logo.leaves.map(([x, y, r], i) => {
            const s = spring({ frame: frame - 44 - i * 4, fps, config: { damping: 12, mass: 0.5 } });
            return (
              <g key={i} transform={`translate(${x},${y}) rotate(${r}) scale(${s})`} fill={C.gold}>
                <path d={logo.leaf} />
                <circle cx={-10.7} cy={8.5} r={4.3} />
                <circle cx={10.7} cy={8.5} r={4.3} />
              </g>
            );
          })}
          {/* Letters rise into place, then a light sweeps across them. */}
          <g style={{ opacity: fade(frame, 46, 70), transform: `translateY(${interpolate(fade(frame, 46, 76), [0, 1], [26, 0])}px)` }}>
            <path d={logo.comme} fill="url(#sweep)" />
          </g>
          <g style={{ opacity: fade(frame, 56, 80), transform: `translateY(${interpolate(fade(frame, 56, 86), [0, 1], [26, 0])}px)` }}>
            <path d={logo.avant} fill="url(#sweep)" />
          </g>
          <path d={logo.restaurant} fill={C.gold} opacity={fade(frame, 74, 96)} />
          <path d={logo.dardilly} fill={C.gold} opacity={fade(frame, 80, 102)} />
        </svg>
        <div
          style={{
            marginTop: portrait ? 90 : 56,
            width: interpolate(fade(frame, 100, 126), [0, 1], [0, portrait ? 420 : 520]),
            height: 1,
            background: C.gold,
            opacity: 0.8,
          }}
        />
        <div
          style={{
            marginTop: portrait ? 44 : 30,
            fontFamily: FONT_DISPLAY,
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: portrait ? 64 : 52,
            color: C.cream,
            opacity: fade(frame, 108, 136),
            transform: `translateY(${interpolate(fade(frame, 108, 140), [0, 1], [18, 0])}px)`,
          }}
        >
          Cuisine française de saison
        </div>
        <div style={{ marginTop: 18, fontFamily: FONT_LABEL, fontSize: portrait ? 24 : 20, letterSpacing: "0.34em", color: C.gold, opacity: fade(frame, 118, 146) }}>
          DARDILLY-LE-BAS
        </div>
      </AbsoluteFill>
      <Vignette strength={0.75} />
      <Grain opacity={0.1} />
    </AbsoluteFill>
  );
}
