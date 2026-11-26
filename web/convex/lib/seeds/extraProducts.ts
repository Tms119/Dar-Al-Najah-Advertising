/* Products for services on the shop's flyer that the catalogue didn't have.
   Added to existing categories (by slug) and groups (by name; created when
   missing). Photos come from PHOTO_PROMPTS in photoPrompts.ts. Original copy. */
export type ExtraProduct = { category: string; group: string; name: string; desc: string; shape: string };

export const EXTRA_PRODUCTS: ExtraProduct[] = [
  { category: "printing", group: "Commercial Printing", name: "Offset Printing", shape: "booklet",
    desc: "High volume printing for brochures, flyers, letterheads and books, with sharp detail and consistent colour across thousands of copies at a lower cost per piece." },
  { category: "printing", group: "Commercial Printing", name: "Digital Printing", shape: "flyer",
    desc: "Fast full colour printing for short runs and urgent jobs, from a handful of copies to a few hundred, with no setup time." },
  { category: "printing", group: "Commercial Printing", name: "Brochures", shape: "booklet",
    desc: "Folded and stapled brochures that present your company, menu or product range, printed on quality paper in a choice of sizes and finishes." },
  { category: "printing", group: "Commercial Printing", name: "Invoice Book", shape: "booklet",
    desc: "Numbered invoice, receipt and delivery note books in duplicate or triplicate carbonless paper, printed with your logo and details." },
  { category: "printing", group: "Publishing", name: "Diary", shape: "notebook",
    desc: "Branded diaries and planners with your logo on the cover, popular for corporate gifting at the start of the year." },
  { category: "fabric", group: "Embroidery & Textiles", name: "Screen Printing", shape: "shirt",
    desc: "Bold, long lasting prints on t shirts, hoodies, bags and uniforms, ideal for bulk orders in one or a few solid colours." },
  { category: "gifts", group: "Gift Products", name: "Pen Printing", shape: "pen",
    desc: "Ballpoint and metal pens printed with your logo, a practical giveaway for events, offices and hotels." },
  { category: "stickers", group: "Signage", name: "Sign Board", shape: "sticker",
    desc: "Shop and office sign boards in aluminium composite, acrylic or flex, printed with your name and logo for a clear first impression." },
  { category: "stickers", group: "Signage", name: "LED Sign Board", shape: "sticker",
    desc: "Illuminated signs and light boxes that keep your shop front visible day and night." },
  { category: "stickers", group: "Signage", name: "3D Letter Signs", shape: "sticker",
    desc: "Raised acrylic or metal letters for shop fronts, receptions and lobbies, with or without LED lighting." },
  { category: "stickers", group: "Signage", name: "Flex Banner Printing", shape: "banner",
    desc: "Large format flex banners for shop fronts, events and building fronts, printed in full colour and finished with eyelets." },
];
