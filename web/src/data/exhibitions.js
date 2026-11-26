/* Exhibition page: photos live in /public/exhibitions (exhibition-NN.jpg,
   with their pixel sizes so the gallery reserves the right space). */

export const EXHIBITION = {
  color: '#21AAE1',
  tint: '#E0F4FB',
};

export const EXHIBITION_GROUPS = [
  { id: 'booths', name: 'Booths & stands' },
  { id: 'popups', name: 'Pop-up displays' },
  { id: 'signage', name: 'Event signage' },
];

// [file number, width, height, group, title]
const RAW = [
  [8, 1600, 1066, 'booths', 'Island booth with backlit city panels'],
  [9, 1500, 1050, 'booths', 'Bold colour block pavilion'],
  [14, 1600, 1130, 'booths', 'Pastel arch pavilion'],
  [20, 1140, 750, 'booths', 'Gradient wall stand with lounge'],
  [30, 1500, 930, 'booths', 'Mall atrium brand activation'],
  [3, 1024, 729, 'booths', 'Themed cafe stand'],
  [10, 1200, 900, 'booths', 'Arched walk-through display'],
  [19, 900, 600, 'booths', 'Home living showroom stand'],
  [21, 1000, 667, 'booths', 'Shell scheme booth with counter'],
  [24, 1000, 700, 'booths', 'Shell scheme booth with garden graphics'],
  [28, 900, 700, 'booths', 'Corner booth with brochure stands'],
  [26, 900, 674, 'booths', 'Shell scheme panel graphics'],
  [27, 830, 369, 'booths', 'L-shaped stand with screen'],
  [6, 1600, 519, 'booths', 'Two-sided corner stand'],
  [29, 1000, 700, 'booths', 'Open stand with sponsor wall'],
  [13, 720, 480, 'booths', 'Backlit fabric wall stand'],
  [2, 562, 355, 'booths', 'Modular stand with built-in screen'],
  [15, 1024, 729, 'booths', 'Island stand with branded header'],
  [11, 1600, 1217, 'popups', 'Pop-up backdrop with counter'],
  [12, 751, 751, 'popups', 'Curved pop-up wall'],
  [7, 554, 554, 'popups', 'Curved pop-up with podium'],
  [16, 1080, 1080, 'popups', 'Curved pop-up stand'],
  [5, 900, 600, 'popups', 'Straight pop-up stand and podium'],
  [17, 1000, 1000, 'popups', 'Pop-up display set'],
  [18, 678, 452, 'popups', 'Pop-up, counter and roll-up kit'],
  [22, 640, 360, 'signage', 'Roll-up banners'],
  [1, 900, 700, 'signage', 'Feather flags'],
  [25, 576, 321, 'signage', 'Lightbox displays'],
];

export const EXHIBITION_PHOTOS = RAW.map(([n, w, h, group, title]) => ({
  src: `/exhibitions/exhibition-${String(n).padStart(2, '0')}.jpg`,
  width: w,
  height: h,
  group,
  title,
}));

export const EXHIBITION_SERVICES = [
  ['Booths & custom stands', 'Shell scheme upgrades, island stands and brand pavilions for trade shows and malls.', 'M3 21V9l9-6 9 6v12M9 21v-6h6v6'],
  ['Pop-up backdrops', 'Straight and curved pop-up walls with matching counters and podiums.', 'M4 4h16v12H4zM8 20h8M12 16v4'],
  ['Roll-ups, flags & lightboxes', 'Portable signage that sets up in minutes, for events, launches and lobbies.', 'M6 3v18M6 4h11l-2 4 2 4H6'],
  ['Design & artwork', 'No artwork yet? Our designers lay out the graphics to fit your stand exactly.', 'M4 20l4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10zM13.5 7.5l3 3'],
];
