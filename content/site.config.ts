// Restaurant identity, contact details and legal information.
// Edit the values between quotes; keep `null` for anything unknown (the site hides it or says so).

export const site = {
  name: "Restaurant Comme Avant",
  shortName: "Comme Avant",
  town: "Dardilly",
  url: "https://www.restaurant-comme-avant.com",
  description:
    "Restaurant de cuisine française au cœur de Dardilly-le-Bas, à côté de l'église : cuisine de saison, broche du jour, terrasse calme et carte des vins des vallées du Rhône et de Bourgogne.",
  owners: "Magali et Fabrice Guillon",
  address: {
    street: "3 place de l'Église",
    postalCode: "69570",
    city: "Dardilly",
    country: "FR",
    // Directions note only (not part of the official address).
    access: "Dans la petite ruelle piétonne à côté de l'église, à Dardilly-le-Bas.",
  },
  phone: { display: "04 78 66 19 57", e164: "+33478661957" },
  email: "contact@restaurant-comme-avant.com",
  parking: "Parking sur place.",
  priceRange: "20–50 €",
  cuisine: "Cuisine française",
  social: {
    facebook: "https://www.facebook.com/restaurantcommeavant/",
    instagram: null as string | null,
  },
  // Booking requests are received through Netlify Forms and e-mailed to `email`.
  booking: {
    formName: "reservation",
  },
  legal: {
    companyName: "LE COMPTOIR",
    legalForm: "SARL",
    capital: null as string | null,
    headOffice: "3 place de l'Église, 69570 Dardilly",
    rcs: "RCS Lyon",
    siren: "750 255 846",
    siret: "750 255 846 00032",
    vat: "FR17750255846",
    publicationDirector: "Fabrice Guillon, gérant",
    mediator: null as { name: string; url: string; address: string } | null,
    host: {
      name: "Netlify, Inc.",
      address: "101 2nd Street, San Francisco, CA 94105, États-Unis",
      // LCEN: the host's phone number. Copy it from Netlify's official contact page, then it shows in the
      // mentions légales automatically.
      phone: null as string | null,
      url: "https://www.netlify.com",
    },
    credits: [
      "Photographies : Restaurant Comme Avant.",
      "Logo : redessin vectoriel d'après le logo du restaurant.",
      "Polices : Spectral (Production Type) et Montserrat (Julieta Ulanovsky), licence SIL Open Font License 1.1.",
    ],
  },
} as const;

export type Site = typeof site;
