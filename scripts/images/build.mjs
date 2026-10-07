// Generates responsive AVIF + WebP variants and blur placeholders for every retouched master.
// Input:  assets/photos/retouched/*.jpg (id = file name) and assets/photos/v2/graded/*.jpg, the
//         « nocturne » grade from scripts/photos/v2/grade.py (id = "nuit-" + file name)
// Output: public/img/<id>-<hash>/<width>.{avif,webp}
//         src/lib/images.generated.json (sizes + tiny blur placeholder per photo)
// Only re-encodes a photo when its master changed (hash stored in the manifest).
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "../..");
const SOURCES = [
  { dir: path.join(ROOT, "assets/photos/retouched"), prefix: "" },
  { dir: path.join(ROOT, "assets/photos/v2/graded"), prefix: "nuit-" },
];
const OUT = path.join(ROOT, "public/img");
const MANIFEST = path.join(ROOT, "src/lib/images.generated.json");
const WIDTHS = [360, 540, 720, 960, 1280, 1600, 1920];
const EXCLUDED = new Set(["salle-allee-carreaux"]); // staff member visible: not publishable

const previous = existsSync(MANIFEST) ? JSON.parse(await readFile(MANIFEST, "utf8")) : {};
const manifest = {};

const files = [];
for (const { dir, prefix } of SOURCES) {
  if (!existsSync(dir)) continue;
  for (const f of (await readdir(dir)).filter((f) => f.endsWith(".jpg")).sort()) files.push({ file: path.join(dir, f), id: prefix + path.basename(f, ".jpg"), base: path.basename(f, ".jpg") });
}
for (const { file, id, base } of files) {
  if (EXCLUDED.has(base)) continue;
  const buf = await readFile(file);
  const hash = createHash("sha1").update(buf).digest("hex").slice(0, 12);
  const meta = await sharp(buf).metadata();
  const widths = WIDTHS.filter((w) => w < meta.width);
  widths.push(Math.min(meta.width, 1920));
  const unique = [...new Set(widths)].sort((a, b) => a - b);

  const dir = `${id}-${hash}`; // content hash in the path: files can be cached forever
  if (previous[id]?.hash === hash && unique.every((w) => existsSync(path.join(OUT, dir, `${w}.avif`)))) {
    manifest[id] = previous[id];
    continue;
  }
  // Re-use variants already encoded under the old folder layout, otherwise encode.
  await mkdir(path.join(OUT, dir), { recursive: true });
  for (const w of unique) {
    for (const ext of ["avif", "webp"]) {
      const legacy = path.join(OUT, id, `${w}.${ext}`);
      const target = path.join(OUT, dir, `${w}.${ext}`);
      if (existsSync(legacy)) {
        await writeFile(target, await readFile(legacy));
        continue;
      }
      const pipeline = sharp(buf).resize({ width: w, withoutEnlargement: true });
      if (ext === "avif") await pipeline.avif({ quality: 52, effort: 6 }).toFile(target);
      else await pipeline.webp({ quality: 76, effort: 5 }).toFile(target);
    }
  }
  const tiny = await sharp(buf).resize({ width: 16 }).webp({ quality: 40 }).toBuffer();
  manifest[id] = {
    hash,
    dir,
    width: meta.width,
    height: meta.height,
    widths: unique,
    blur: `data:image/webp;base64,${tiny.toString("base64")}`,
  };
  console.log(`${id}: ${unique.join(", ")}`);
}

await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
// Remove folders that no manifest entry points to any more (old hashes, legacy layout).
const keep = new Set(Object.values(manifest).map((m) => m.dir));
for (const entry of await readdir(OUT)) if (!keep.has(entry)) await rm(path.join(OUT, entry), { recursive: true, force: true });
console.log(`${Object.keys(manifest).length} photos in manifest`);
