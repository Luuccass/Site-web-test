// Builds the Open Graph image (1200×630): the navy sign with the logo next to the wine wall photo.
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "../..");
const photo = await sharp(path.join(ROOT, "assets/photos/retouched/salle-mur-vins-paysage.jpg"))
  .resize({ width: 720, height: 630, fit: "cover", position: "centre" })
  .toBuffer();
const logo = await sharp(path.join(ROOT, "assets/brand/logo-comme-avant-stacked.svg"), { density: 300 })
  .resize({ width: 330 })
  .png()
  .toBuffer();
const meta = await sharp(logo).metadata();
await sharp({ create: { width: 1200, height: 630, channels: 3, background: "#17213b" } })
  .composite([
    { input: photo, left: 480, top: 0 },
    { input: logo, left: Math.round((480 - meta.width) / 2), top: Math.round((630 - meta.height) / 2) },
  ])
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile(path.join(ROOT, "public/og.jpg"));
console.log("public/og.jpg");
