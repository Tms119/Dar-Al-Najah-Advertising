/* Three category-specific highlights shown on every product page.
   Only claims the shop has confirmed: no on-site fitting, minimums or delivery promises. */

const I = {
  layers: 'M12 3 3 8l9 5 9-5zM3 13l9 5 9-5',
  stack: 'M4 7h16M4 12h16M4 17h16',
  check: 'M4 12.5l5 5L20 6.5',
  needle: 'M5 19 19 5M14 5h5v5',
  ruler: 'M3 17 17 3l4 4L7 21zM7 13l2 2M10 10l2 2M13 7l2 2',
  drop: 'M12 3s7 7.5 7 12a7 7 0 0 1-14 0c0-4.5 7-12 7-12z',
  gift: 'M4 11h16v9H4zM3 7h18v4H3zM12 7v13M12 7c-2-4-6-3-5 0M12 7c2-4 6-3 5 0',
  box: 'M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10',
  person: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1-4 4-6 8-6s7 2 8 6',
  fold: 'M5 4h14v8l-7 8-7-8z',
  thread: 'M7 21V3M17 21V3M7 8l10 4M7 14l10 4',
  sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5',
  scissors: 'M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.5 7.5 20 18M8.5 16.5 20 6',
  peel: 'M4 4h16v10l-6 6H4zM14 20v-6h6',
  pen: 'M4 20l4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10zM13.5 7.5l3 3',
  pin: 'M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12zM12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
};

const HIGHLIGHTS = {
  printing: [
    ['Paper & finishes', 'Matte, gloss, silk or recycled stock, with options like lamination and spot UV.', I.layers],
    ['Any quantity', 'A short run for an event or thousands for a campaign.', I.stack],
    ['Print-ready check', 'We check your file before printing and fix what would print badly.', I.check],
  ],
  fabric: [
    ['Print or embroidery', 'We recommend the method that suits your design and fabric.', I.needle],
    ['Your sizes', 'Mix sizes and colours in one order for the whole team.', I.ruler],
    ['Wash-tested', 'Colours and stitching made to last wash after wash.', I.drop],
  ],
  gifts: [
    ['Your logo on it', 'Printed, engraved or embroidered, whatever suits the item.', I.gift],
    ['Gift-ready', 'Boxed and packed per person, ready to hand out.', I.box],
    ['Corporate orders', 'One contact for the whole set, from choosing to finished.', I.person],
  ],
  'woven-labels': [
    ['Any fold', 'Straight, end fold, centre fold, mitre fold or loop.', I.fold],
    ['Made to your size', 'Width, length and edges made to fit your garment.', I.ruler],
    ['Thread-matched', 'Thread colours matched to your brand.', I.thread],
  ],
  stickers: [
    ['Indoor & outdoor vinyl', 'UV and weather-resistant materials for windows, walls and vehicles.', I.sun],
    ['Cut to any shape', 'Contour-cut to your logo, lettering or any size you need.', I.scissors],
    ['Clean removal', 'Vinyl that comes off without damaging glass or paint.', I.peel],
  ],
};

const DEFAULT = [
  ['Free proof', 'We send a digital proof before anything is printed.', I.check],
  ['Design help', 'No artwork? Our designers can create it for you.', I.pen],
  ['Visit the shop', 'See samples at Nakheel Plaza, Deira.', I.pin],
];

export const highlightsFor = (category) => HIGHLIGHTS[category] ?? DEFAULT;
