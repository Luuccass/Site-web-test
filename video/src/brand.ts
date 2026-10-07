import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Brand of the V2 « Nocturne » website, shared by every composition.
export const C = {
  night: "#0b1020",
  navy: "#17213b",
  gold: "#c9a86a",
  goldDeep: "#a78547",
  cream: "#f3ede2",
};

export const FONT_DISPLAY = "Cormorant Garamond";
export const FONT_LABEL = "Montserrat Caps";

let loaded: Promise<unknown> | null = null;
export function loadBrandFonts() {
  if (!loaded) {
    loaded = Promise.all([
      loadFont({ family: FONT_DISPLAY, url: staticFile("fonts/CormorantGaramond-Variable.woff2"), weight: "300 700", style: "normal" }),
      loadFont({ family: FONT_DISPLAY, url: staticFile("fonts/CormorantGaramond-Italic-Variable.woff2"), weight: "300 700", style: "italic" }),
      loadFont({ family: FONT_LABEL, url: staticFile("fonts/Montserrat-Medium-caps.woff2"), weight: "500" }),
    ]);
  }
  return loaded;
}
