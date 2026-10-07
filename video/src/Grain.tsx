import { AbsoluteFill, useCurrentFrame } from "remotion";

// Film grain: an SVG noise tile whose seed changes every 2 frames, blended over the picture.
export function Grain({ opacity = 0.12 }: { opacity?: number }) {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2) % 12;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "overlay", opacity }}>
      <svg width="100%" height="100%">
        <filter id={`g${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={seed} stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.6 0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#g${seed})`} />
      </svg>
    </AbsoluteFill>
  );
}

// Soft vignette that keeps the eye in the centre.
export function Vignette({ strength = 0.7 }: { strength?: number }) {
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        background: `radial-gradient(120% 90% at 50% 45%, rgba(11,16,32,0) 45%, rgba(11,16,32,${strength}) 100%)`,
      }}
    />
  );
}
