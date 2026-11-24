/* A category's starter content: created once by catalogSeeds:setup, then
   edited in the admin like any other category. `photo` describes the product
   shot generated for each item (catalogSeeds:generateImages). */
export type SeedItem = { name: string; desc: string; photo: string; badge?: string };

export type CategorySeed = {
  category: {
    slug: string;
    name: string;
    shortName: string;
    tagline: string;
    color: string;
    tint: string;
    heroShape: string;
  };
  /** illustration used until a product has a photo */
  shape: string;
  /** cover photo for the category (menu, home page) */
  heroPhoto: string;
  groups: { name: string; items: SeedItem[] }[];
};
