/** "Roll-up Stands & Banners" → "roll-up-stands-and-banners" (URL slugs only). */
export const slugify = (s) =>
  s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
