import type { MetadataRoute } from "next";
import { menu, site, wines } from "@/lib/data";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, lastModified: string, priority: number) => ({ url: `${site.url}${path}`, lastModified, priority });
  return [
    page("/", menu.updatedAt, 1),
    page("/la-carte/", menu.updatedAt, 0.9),
    page("/la-carte/vins/", wines.updatedAt, 0.7),
    page("/le-restaurant/", "2026-10-07", 0.6),
    page("/galerie/", "2026-10-07", 0.5),
    page("/nous-trouver/", "2026-10-07", 0.8),
    page("/reserver/", "2026-10-07", 0.8),
    page("/mentions-legales/", "2026-10-07", 0.1),
    page("/confidentialite/", "2026-10-07", 0.1),
  ];
}
