/* Business details shown across the site. Placeholder values: confirm with the client. */
export const COMPANY = {
  name: 'Dar Al Najah',
  full: 'Dar Al Najah Advertising',
  phone: '+971 4 000 0000',
  whatsapp: '971506762586', // +971 50 676 2586
  email: 'hello@daralnajahadv.com',
  address: 'Dubai, United Arab Emirates',
  hours: 'Saturday to Thursday, 9am to 10pm',
};

/** Canonical site origin, used for metadata, sitemap and structured data. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const telHref = `tel:${COMPANY.phone.replace(/\s/g, '')}`;

/** WhatsApp chat with the shop, with a pre-filled message. */
export const waLink = (text) =>
  `https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(text)}`;
