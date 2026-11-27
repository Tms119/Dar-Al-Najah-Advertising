/* Categories made from products that already exist elsewhere: each product
   stays in its own category and is also listed here (by slug). Original copy. */
export type LinkedCategory = {
  slug: string; name: string; shortName: string; tagline: string; color: string; tint: string; heroShape: string;
  groups: { name: string; products: string[] }[];
};

export const LINKED_CATEGORIES: LinkedCategory[] = [
  {
    slug: "digital-offset-printing",
    name: "Digital & Offset Printing",
    shortName: "Digital & Offset",
    tagline: "Short runs printed digitally the same day, big runs on offset at a lower cost per piece.",
    color: "#0E9F8E",
    tint: "#DDF5F1",
    heroShape: "booklet",
    groups: [
      { name: "Print runs", products: ["offset-printing", "digital-printing"] },
      { name: "Marketing print", products: ["flyers", "leaflet", "brochures", "booklet", "catalog", "magazine", "manual"] },
      { name: "Office stationery", products: ["letterhead", "envelope", "invoice-book", "calendar", "diary"] },
    ],
  },
  {
    slug: "signboards",
    name: "Signboard & PVC Sticker",
    shortName: "Signboards",
    tagline: "Shop signs, LED and letter signs, flex banners and PVC stickers that make your business easy to find.",
    color: "#E63946",
    tint: "#FDE3E5",
    heroShape: "sticker",
    groups: [
      { name: "Signboards", products: ["sign-board", "led-sign-board", "3d-letter-signs", "flex-banner-printing"] },
      { name: "PVC stickers", products: ["transparent-pvc-stickers", "white-pvc-stickers"] },
    ],
  },
];

/** Category order on the site (Exhibitions sits between stickers and fabric on the home page). */
export const CATEGORY_ORDER = [
  "printing", "digital-offset-printing", "woven-labels", "signboards", "gifts", "stickers", "fabric",
];
