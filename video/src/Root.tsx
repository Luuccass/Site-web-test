import { Composition } from "remotion";
import { loadBrandFonts } from "./brand";
import { LogoReveal } from "./LogoReveal";
import { REEL_FRAMES, Reel } from "./Reel";

loadBrandFonts();

export function RemotionRoot() {
  return (
    <>
      <Composition id="LogoReveal" component={LogoReveal} durationInFrames={165} fps={30} width={1920} height={1080} />
      <Composition id="LogoRevealVertical" component={LogoReveal} durationInFrames={165} fps={30} width={1080} height={1920} />
      <Composition id="Reel" component={Reel} durationInFrames={REEL_FRAMES} fps={30} width={1080} height={1920} />
    </>
  );
}
