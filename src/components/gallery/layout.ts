import manifest from "@/lib/images.generated.json";
import { gallery } from "@/lib/data";

// Editorial layout of the Galerie page. Photos, alt texts, captions and focal points come from
// content/gallery.json; this file only decides the order, the frame of each thumbnail and the rows.
// A photo added to gallery.json later appears at the end of its section, framed by its own shape.

export type GalleryPhoto = (typeof gallery.photos)[number];
export type Frame = "4/5" | "1/1" | "3/2";

export const FRAME_VALUE: Record<Frame, number> = { "4/5": 4 / 5, "1/1": 1, "3/2": 3 / 2 };

/** Curated order and frames for today's photos (rooms read best wide, dishes square or 4:5). */
const CURATED: Record<string, Frame> = {
  // La maison: arrive by the ruelle, enter the salle, end in the cave.
  "exterieur-ruelle": "4/5",
  "salle-mur-vins": "3/2",
  "salle-arche-bar": "4/5",
  "detail-carreaux-ciment": "4/5",
  "salle-cave-chartreuse": "1/1",
  // The wide sign leads its row of three: on phones it takes the full width over two portraits.
  enseigne: "3/2",
  "detail-niche-chartreuse": "4/5",
  "salle-mur-vins-portrait": "4/5",
  // Assiettes des derniers mois: plats first, the house chocolate last.
  "plat-poulpe": "4/5",
  "dessert-moelleux-fruits-rouges": "3/2",
  "plat-entrecote": "1/1",
  "plat-pate-en-croute": "4/5",
  "dessert-ile-flottante": "1/1",
  "dessert-pomme-pochee": "4/5",
  "dessert-moelleux-chocolat": "1/1",
};
const CURATED_ORDER = Object.keys(CURATED);

/** Wide photos cropped to 3:2 need their own horizontal anchor (keeps the whole word on the sign). */
export const FRAME_FOCAL: Record<string, [number, number]> = {
  enseigne: [0.36, 0.6],
};

type Manifest = Record<string, { width: number; height: number }>;
const images = manifest as Manifest;

/** Native width / height of a photo (the lightbox shows it uncropped). */
export function nativeRatio(id: string): number {
  const img = images[id];
  if (!img) throw new Error(`Unknown photo "${id}": run npm run images`);
  return img.width / img.height;
}

function frameFor(id: string): Frame {
  if (CURATED[id]) return CURATED[id];
  const r = nativeRatio(id);
  return r < 0.9 ? "4/5" : r < 1.25 ? "1/1" : "3/2";
}

export type GalleryItem = GalleryPhoto & { frame: Frame; index: number };
export type GalleryRow = GalleryItem[];
export type GallerySection = {
  id: "maison" | "assiettes";
  title: string;
  rows: GalleryRow[];
};

/** Row sizes alternate 2, 3, 2, 3… and never leave a photo alone on the last row. */
function toRows(items: GalleryItem[]): GalleryRow[] {
  const rows: GalleryRow[] = [];
  let i = 0;
  let size = 2;
  while (i < items.length) {
    const left = items.length - i;
    let take = Math.min(size, left);
    if (left - take === 1) take = take < 3 ? take + 1 : take - 1;
    rows.push(items.slice(i, i + take));
    i += take;
    size = size === 2 ? 3 : 2;
  }
  return rows;
}

function byCuratedOrder(a: GalleryPhoto, b: GalleryPhoto) {
  const ia = CURATED_ORDER.indexOf(a.id);
  const ib = CURATED_ORDER.indexOf(b.id);
  return (ia === -1 ? Infinity : ia) - (ib === -1 ? Infinity : ib);
}

export function buildGallery(): { sections: GallerySection[]; items: GalleryItem[] } {
  const house = gallery.photos.filter((p) => p.group !== "assiettes").sort(byCuratedOrder);
  const plates = gallery.photos.filter((p) => p.group === "assiettes").sort(byCuratedOrder);
  const items: GalleryItem[] = [...house, ...plates].map((p, index) => ({ ...p, frame: frameFor(p.id), index }));
  const houseItems = items.slice(0, house.length);
  const plateItems = items.slice(house.length);
  return {
    items,
    sections: [
      { id: "maison", title: "La maison", rows: toRows(houseItems) },
      { id: "assiettes", title: "Assiettes des derniers mois", rows: toRows(plateItems) },
    ],
  };
}
