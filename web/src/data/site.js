/* Business details shown across the site. The shop's phone is its WhatsApp number. */
export const COMPANY = {
  name: 'Dar Al Najah',
  full: 'Dar Al Najah Advertising',
  phone: '+971 50 676 2586',
  whatsapp: '971506762586',
  address: 'Shop No. 10, Nakheel Plaza, Deira, Dubai, United Arab Emirates',
  hours: 'Saturday to Thursday, 9am to 10pm',
};

/** Official social profiles (footer links and structured data). */
export const SOCIALS = [
  { name: 'Instagram', url: 'https://www.instagram.com/daralnajahadvertisinguae/' },
  { name: 'Facebook', url: 'https://www.facebook.com/DarAlNajahAdvertising' },
  { name: 'TikTok', url: 'https://www.tiktok.com/@daralnajahadvertisinguae' },
];

/** Google Maps directions to the shop. */
export const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(COMPANY.address)}`;

/** Canonical site origin, used for metadata, sitemap and structured data. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const telHref = `tel:${COMPANY.phone.replace(/\s/g, '')}`;

/** Categories with their own landing page; the rest use the filtered catalogue. */
const CATEGORY_PAGES = { 'woven-labels': '/woven-labels' };
export const categoryHref = (slug) => CATEGORY_PAGES[slug] ?? `/products?cat=${slug}`;

/** WhatsApp chat with the shop, with a pre-filled message. */
export const waLink = (text) =>
  `https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(text)}`;

/** Full link to a page (or file) on this site, e.g. pageLink('/products/flyers'). */
export const pageLink = (path) => `${SITE_URL}${path}`;

/** WhatsApp message that ends with a link to the page it's about, so staff
    see exactly which product or photo the customer means. */
export const waAbout = (text, path) => waLink(`${text}\n${pageLink(path)}`);
