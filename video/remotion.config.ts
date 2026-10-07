// Remotion CLI / Studio configuration.
// The container has no GPU and must not download Chrome: use the preinstalled Chromium.
import { Config } from "@remotion/cli/config";

Config.setBrowserExecutable(
  process.env.REMOTION_BROWSER ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
);
Config.setChromeMode("chrome-for-testing");
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
Config.setConcurrency(4);
