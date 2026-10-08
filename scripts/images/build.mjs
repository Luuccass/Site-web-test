// Generates responsive AVIF + WebP variants and blur placeholders for every retouched master.
// Input:  assets/photos/retouched/*.jpg (id = file name) and assets/photos/v2/graded/*.jpg, the
//         « nocturne » grade from scripts/photos/v2/grade.py (id = "nuit-" + file name)
// Output: public/img/<id>-<hash>/<width>.{avif,webp}
//         src/lib/images.generated.json (sizes + tiny blur placeholder per photo)
// Only re-encodes a photo when its master changed (hash stored in the manifest).
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { availableParallelism } from "node:os";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "../..");
// avif: AVIF quality. The night-graded photos carry film grain and sit under gradients and the grain
// overlay, so they take a lower quality without visible loss (they are the big LCP heroes).
const SOURCES = [
  { dir: path.join(ROOT, "assets/photos/retouched"), prefix: "", avif: 52 },
  { dir: path.join(ROOT, "assets/photos/v2/graded"), prefix: "nuit-", avif: 46 },
];
const OUT = path.join(ROOT, "public/img");
const MANIFEST = path.join(ROOT, "src/lib/images.generated.json");
// 800: full-width heroes on most phones (412 px at DPR 1.75, 390 px at DPR 2) without jumping to 960.
const WIDTHS = [360, 540, 720, 800, 960, 1280, 1600, 1920];
const EXCLUDED = new Set(["salle-allee-carreaux"]); // staff member visible: not publishable

const previous = existsSync(MANIFEST) ? JSON.parse(await readFile(MANIFEST, "utf8")) : {};
const manifest = {};

const files = [];
for (const { dir, prefix, avif } of SOURCES) {
  if (!existsSync(dir)) continue;
  for (const f of (await readdir(dir)).filter((f) => f.endsWith(".jpg")).sort()) files.push({ file: path.join(dir, f), id: prefix + path.basename(f, ".jpg"), base: path.basename(f, ".jpg"), avif });
}
async function encode({ file, id, base, avif }) {
  if (EXCLUDED.has(base)) return;
  const buf = await readFile(file);
  // The encoding settings are part of the hash, so changing them re-encodes (and renames) the variants.
  const hash = createHash("sha1").update(buf).update(JSON.stringify({ WIDTHS, avif, webp: 76 })).digest("hex").slice(0, 12);
  const meta = await sharp(buf).metadata();
  const widths = WIDTHS.filter((w) => w < meta.width);
  widths.push(Math.min(meta.width, 1920));
  const unique = [...new Set(widths)].sort((a, b) => a - b);

  const dir = `${id}-${hash}`; // content hash in the path: files can be cached forever
  if (previous[id]?.hash === hash && unique.every((w) => existsSync(path.join(OUT, dir, `${w}.avif`)))) {
    manifest[id] = previous[id];
    return;
  }
  // Re-use variants already encoded under the old folder layout, otherwise encode.
  await mkdir(path.join(OUT, dir), { recursive: true });
  for (const w of unique) {
    for (const ext of ["avif", "webp"]) {
      const legacy = path.join(OUT, id, `${w}.${ext}`);
      const target = path.join(OUT, dir, `${w}.${ext}`);
      if (existsSync(target)) continue; // finished by an interrupted run (files are renamed into place)
      if (existsSync(legacy)) {
        await writeFile(target, await readFile(legacy));
        continue;
      }
      const pipeline = sharp(buf).resize({ width: w, withoutEnlargement: true });
      const tmp = `${target}.tmp`;
      if (ext === "avif") await pipeline.avif({ quality: avif, effort: 6 }).toFile(tmp);
      else await pipeline.webp({ quality: 76, effort: 5 }).toFile(tmp);
      await rename(tmp, target);
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

// One photo per core: libvips' AVIF encoder keeps a single core busy per image.
const queue = [...files];
await Promise.all(Array.from({ length: Math.max(1, availableParallelism()) }, async () => {
  while (queue.length) await encode(queue.shift());
}));

const sorted = Object.fromEntries(Object.keys(manifest).sort().map((k) => [k, manifest[k]])); // stable diff
await writeFile(MANIFEST, JSON.stringify(sorted, null, 2) + "\n");
// Remove folders that no manifest entry points to any more (old hashes, legacy layout).
const keep = new Set(Object.values(manifest).map((m) => m.dir));
for (const entry of await readdir(OUT)) if (!keep.has(entry)) await rm(path.join(OUT, entry), { recursive: true, force: true });
console.log(`${Object.keys(manifest).length} photos in manifest`);
