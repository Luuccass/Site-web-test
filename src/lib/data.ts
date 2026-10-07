// Typed access to the editable content files in /content, plus values derived from them.
import ardoiseJson from "@content/ardoise.json";
import galleryJson from "@content/gallery.json";
import hoursJson from "@content/hours.json";
import menuJson from "@content/menu.json";
import reviewsJson from "@content/reviews.json";
import { site } from "@content/site.config";
import winesJson from "@content/wines.json";
import type { HoursData, ServiceName } from "./status";

export { site };

export type MenuItem = {
  id: string;
  name: string;
  detail?: string;
  price: number | null;
  alcohol?: boolean;
  askAllergens?: boolean;
  allergens: string[];
  allergensValidatedAt: string | null;
};
export type MenuSection = { id: string; title: string; items: MenuItem[] };

export const menu = menuJson as {
  updatedAt: string;
  pricesNote: string;
  formules: { when: string; items: { id: string; label: string; detail: string; price: number }[] };
  sections: MenuSection[];
};

export type Wine = { colour: "rouge" | "blanc" | "rose" | "bulles"; region: string; name: string; price: number; format?: string };
export const wines = winesJson as {
  updatedAt: string;
  note: string;
  byGlass: { colour: string; name: string; sizes: { cl: number; price: number }[] }[];
  sparklingByGlass: { name: string; price: number }[];
  bottles: Wine[];
};

export const hours = hoursJson as {
  timezone: string;
  verifiedThrough: string;
  services: { day: number; service: ServiceName; open: string; close: string }[];
  lastOrders: string | null;
  publicHolidays: "call" | "open" | "closed";
  closures: HoursData["closures"];
  booking: { horizonDays: number; sameDayLeadMinutes: number; slotMinutes: number; groupThreshold: number };
};

export const reviews = reviewsJson as {
  rating: { value: number; count: number; asOf: string; source: string };
  listingUrl: string;
  disclaimer: string;
  excerpts: { id: string; text: string; author: string | null; date: string | null }[];
};

export const gallery = galleryJson as {
  photos: { id: string; group: "salle" | "assiettes" | "details"; alt: string; caption: string; focal: [number, number] }[];
};

export const ardoise = ardoiseJson as { month: string | null; items: { name: string; price?: number | null }[] };

/** Excerpts may only be shown with their author and date (French consumer law). */
export const publishableExcerpts = reviews.excerpts.filter((e) => e.author && e.date);

const dishPrices = menu.sections
  .filter((s) => s.id === "plats")
  .flatMap((s) => s.items)
  .map((i) => i.price)
  .filter((p): p is number => typeof p === "number");

export const formulesText = menu.formules.items.map((f) => `${f.label} ${euro(f.price)}`).join(", ");

export const statusData: HoursData = {
  verifiedThrough: hours.verifiedThrough,
  services: hours.services,
  closures: hours.closures,
  publicHolidays: hours.publicHolidays,
  phone: site.phone.display,
  priceFrom: Math.min(...dishPrices),
  priceTo: Math.max(...dishPrices),
  formules: formulesText,
};

export const directionsUrl =
  "https://www.google.com/maps/dir/?api=1&destination=" +
  encodeURIComponent(`${site.name}, ${site.address.street}, ${site.address.postalCode} ${site.address.city}`);
export const appleMapsUrl = "https://maps.apple.com/?q=" + encodeURIComponent(`${site.name}, ${site.address.street}, ${site.address.postalCode} ${site.address.city}`);

/** 7,50 € with a narrow no-break space (French typography). Integers stay without decimals. */
export function euro(value: number): string {
  const s = Number.isInteger(value) ? String(value) : value.toFixed(2).replace(".", ",");
  return `${s} €`;
}

const DAY_NAMES = ["", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
export function fmtTime(hhmm: string): string {
  const [h, m] = hhmm.split(":");
  return m === "00" ? `${Number(h)} h` : `${Number(h)} h ${m}`;
}
/** One row per weekday: { day, label, midi, soir } with formatted ranges or null. */
export const weekTable = [1, 2, 3, 4, 5, 6, 7].map((day) => {
  const find = (svc: ServiceName) => hours.services.find((s) => s.day === day && s.service === svc);
  const range = (svc: ServiceName) => {
    const s = find(svc);
    return s ? `${fmtTime(s.open)}–${fmtTime(s.close)}` : null;
  };
  return { day, label: DAY_NAMES[day], midi: range("midi"), soir: range("soir") };
});

/** The sentence on the sign at the door, generated from hours.json. */
export const hoursSentence =
  "Le restaurant est ouvert du mardi au samedi midi de 11 h 30 à 14 h et du jeudi au samedi soir de 19 h 30 à 21 h 30.";

export function frenchDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  return `${d === 1 ? "1er" : d} ${months[m - 1]} ${y}`;
}
