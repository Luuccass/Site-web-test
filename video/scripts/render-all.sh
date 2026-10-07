#!/usr/bin/env bash
# Render every brand film into out/ (run from video/, after `npm run plates`).
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p out
npx remotion render LogoReveal out/comme-avant-logo-16x9.mp4
npx remotion render LogoRevealVertical out/comme-avant-logo-9x16.mp4
npx remotion render Reel out/comme-avant-reel.mp4
