/* Business details shown across the site. The shop's phone is its WhatsApp
   number. The address is left out until the client confirms it. */
export const COMPANY = {
  name: 'Dar Al Najah',
  full: 'Dar Al Najah Advertising',
  phone: '+971 50 676 2586',
  whatsapp: '971506762586',
  hours: 'Saturday to Thursday, 9am to 10pm',
};

/** Canonical site origin, used for metadata, sitemap and structured data. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const telHref = `tel:${COMPANY.phone.replace(/\s/g, '')}`;

/** Categories with their own landing page; the rest use the filtered catalogue. */
const CATEGORY_PAGES = { 'woven-labels': '/woven-labels' };
export const categoryHref = (slug) => CATEGORY_PAGES[slug] ?? `/products?cat=${slug}`;

/** WhatsApp chat with the shop, with a pre-filled message. */
export const waLink = (text) =>
  `https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(text)}`;
