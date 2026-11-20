/* Business details shown across the site. Placeholder values — confirm with the client. */
export const COMPANY = {
  name: 'Dar Al Najah',
  full: 'Dar Al Najah Advertising',
  phone: '+971 4 000 0000',
  whatsapp: '971500000000',
  email: 'hello@daralnajahadv.com',
  address: 'Dubai, United Arab Emirates',
  hours: 'Saturday to Thursday, 9am to 10pm',
};

export const waLink = (text) =>
  `https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(text)}`;
