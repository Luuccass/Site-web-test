import { euro, hours, menu, site, wines } from "@/lib/data";

const DAY_URI = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d) => (d ? `https://schema.org/${d}` : ""));

function Script({ data }: { data: unknown }) {
  // Escape "<" so the JSON can never close the script element.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function restaurantNode() {
  const byWindow = new Map<string, number[]>();
  for (const s of hours.services) {
    const key = `${s.open}-${s.close}`;
    byWindow.set(key, [...(byWindow.get(key) ?? []), s.day]);
  }
  return {
    "@type": "Restaurant",
    "@id": `${site.url}/#restaurant`,
    name: site.name,
    url: `${site.url}/`,
    telephone: site.phone.e164,
    email: site.email,
    image: [`${site.url}/og.jpg`],
    servesCuisine: site.cuisine,
    priceRange: site.priceRange,
    acceptsReservations: `${site.url}/reserver/`,
    hasMenu: `${site.url}/la-carte/`,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      postalCode: site.address.postalCode,
      addressLocality: site.address.city,
      addressCountry: site.address.country,
    },
    sameAs: [site.social.facebook].filter(Boolean),
    openingHoursSpecification: [...byWindow.entries()].map(([window, days]) => {
      const [opens, closes] = window.split("-");
      return { "@type": "OpeningHoursSpecification", dayOfWeek: days.map((d) => DAY_URI[d]), opens, closes };
    }),
    ...(hours.closures.length
      ? {
          specialOpeningHoursSpecification: hours.closures
            .filter((c) => !c.services)
            .map((c) => ({ "@type": "OpeningHoursSpecification", validFrom: c.from, validThrough: c.to, opens: "00:00", closes: "00:00" })),
        }
      : {}),
  };
}

export function RestaurantJsonLd() {
  return <Script data={{ "@context": "https://schema.org", ...restaurantNode() }} />;
}

export function MenuJsonLd() {
  const priced = (price: number | null) =>
    price === null ? {} : { offers: { "@type": "Offer", price: price.toFixed(2), priceCurrency: "EUR" } };
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "Menu",
        name: `La carte du ${site.name}`,
        url: `${site.url}/la-carte/`,
        inLanguage: "fr",
        hasMenuSection: menu.sections.map((s) => ({
          "@type": "MenuSection",
          name: s.title,
          hasMenuItem: s.items.map((i) => ({ "@type": "MenuItem", name: i.name, ...priced(i.price) })),
        })),
      }}
    />
  );
}

export function WineMenuJsonLd() {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "Menu",
        name: `Les vins du ${site.name}`,
        url: `${site.url}/la-carte/vins/`,
        inLanguage: "fr",
        hasMenuItem: wines.bottles.map((w) => ({
          "@type": "MenuItem",
          name: w.name,
          offers: { "@type": "Offer", price: w.price.toFixed(2), priceCurrency: "EUR" },
        })),
      }}
    />
  );
}

export { euro };
