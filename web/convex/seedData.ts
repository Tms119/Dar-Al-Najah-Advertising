/* Starter catalogue used once to seed the database (convex/seed.ts).
   After seeding, the admin dashboard is the source of truth. */

export type SeedCategory = {
  id: string; name: string; short: string; tagline: string; color: string; tint: string; hero: string;
  groups: { name: string; items: [string, string][] }[];
};
export type SeedDetail = {
  price: number; unit: string; turnaround: string; badge?: string; desc: string;
  options: Record<string, string[]>; qty: number[];
};
export type SeedDefault = { price: number; turnaround: string; options: Record<string, string[]>; qty: number[] };

export const slugify = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/* [name, shape] — shape picks the illustrated mockup on the website */
export const CATALOG: SeedCategory[] = [
  {
    id: 'printing',
    name: 'Printing Services',
    short: 'Printing',
    tagline: 'Digital & offset print — from one business card to a million flyers.',
    color: '#2B3BFF',
    tint: '#E6E8FF',
    hero: 'card',
    groups: [
      { name: 'Commercial Printing', items: [
        ['Business Cards', 'card'], ['Flyers', 'flyer'], ['Leaflet', 'flyer'], ['Poster', 'poster'],
        ['Wedding Card', 'card'], ['Greeting Card', 'card'], ['Booklet', 'booklet'], ['Raised Printing', 'card'],
        ['Catalog', 'booklet'], ['Presentation Folders', 'folder'], ['Calendar', 'calendar'],
        ['Letterhead', 'flyer'], ['Envelope', 'envelope']] },
      { name: 'Marketing & Promotional', items: [
        ['NFC Card', 'card'], ['PVC ID Card', 'badge'], ['Banner', 'banner'], ['Roll-up Stands', 'rollup'],
        ['Pop-up Stands', 'rollup'], ['X-Stands', 'rollup'], ['Sticker', 'sticker'], ['Postcard', 'card'],
        ['Gift Voucher', 'card'], ['Coupon', 'card'], ['Magnet', 'sticker']] },
      { name: 'Branded Packaging', items: [
        ['Box', 'box'], ['Paper Bag', 'bag'], ['Product Label', 'sticker'], ['Hang Tag', 'tag']] },
      { name: 'Publishing', items: [
        ['Bookmark', 'tag'], ['Magazine', 'booklet'], ['Journal', 'notebook'], ['Manual', 'booklet']] },
    ],
  },
  {
    id: 'fabric',
    name: 'Fabric Printing',
    short: 'Fabric',
    tagline: 'Embroidery, sublimation and team kits — stitched to last.',
    color: '#FF3D7F',
    tint: '#FFE3EC',
    hero: 'shirt',
    groups: [
      { name: 'Embroidery & Textiles', items: [
        ['Embroidery Shirts', 'shirt'], ['Embroidery Hoodie', 'hoodie'], ['Custom Patch', 'patch'],
        ['Abaya Embroidery', 'abaya'], ['Fashion Embroidery', 'shirt'], ['Embroidery Cap', 'cap'],
        ['Embroidery Towel', 'towel'], ['Bathrobe', 'abaya'], ['Custom Apron', 'apron'],
        ['Table Cloths', 'towel'], ['Table Runner', 'towel']] },
      { name: 'Sportswear', items: [
        ['Tracksuit Jacket', 'hoodie'], ['Sports Jersey', 'shirt'], ['Long Sleeve', 'shirt'],
        ['Sports Shorts', 'shorts'], ['Half Sleeve', 'shirt'], ['Crop Top', 'shirt'], ['T-Shirt Printing', 'shirt']] },
    ],
  },
  {
    id: 'gifts',
    name: 'Customised Gifts',
    short: 'Gifts',
    tagline: 'Engraved, printed and wrapped — corporate gifting done right.',
    color: '#F5A400',
    tint: '#FFF1CC',
    hero: 'mug',
    groups: [
      { name: 'Gift Items', items: [
        ['Hoodie Printing', 'hoodie'], ['Engraving Greeting Cards', 'card'], ['Engraving Business Cards', 'card'],
        ['3D Cube Engraving', 'cube'], ['Cap Printing', 'cap'], ['Engraving Notebook', 'notebook']] },
      { name: 'Customised Products', items: [
        ['Photo Album', 'booklet'], ['Pillow Cover', 'pillow'], ['Safety Jacket', 'vest'], ['Safety Helmet', 'helmet'],
        ['Safety Coverall', 'vest'], ['UV Printing Bottle', 'bottle'], ['Print on Ceramics', 'mug'],
        ['Engraving Plates', 'plate'], ['Cutlery Engraving', 'pen'], ['Knife Engraving', 'pen'],
        ['Pen Engraving', 'pen'], ['Wooden Engraving', 'plate'], ['Key Duplication', 'keychain']] },
      { name: 'Gift Packaging', items: [
        ['Gift Wrapping', 'box'], ['Name Plate', 'plate'], ['Key Chain', 'keychain'], ['Custom Flag', 'flag'],
        ['Custom Ribbon', 'ribbon'], ['Lanyard', 'lanyard']] },
      { name: 'Gift Products', items: [
        ['USB', 'usb'], ['Corporate Kit', 'box'], ['Name Badge', 'badge'], ['Mug Printing', 'mug'],
        ['Notebook Printing', 'notebook'], ['Puzzles Printing', 'puzzle']] },
    ],
  },
  {
    id: 'photo',
    name: 'Photo Studio',
    short: 'Photo',
    tagline: 'Passport, visa and portrait shoots — plus restoration magic.',
    color: '#00A86B',
    tint: '#D9F5E9',
    hero: 'camera',
    groups: [
      { name: 'Studio Services', items: [
        ['Passport Size Photo', 'photo'], ['International Visa', 'photo'], ['Schengen Visa', 'photo'],
        ['Baby Infant ID', 'photo'], ['Profile Shoot', 'camera'], ['Family Photoshoot', 'camera']] },
      { name: 'Retouching', items: [
        ['Retouching', 'photo'], ['Colorization', 'photo'], ['Photo Restoration', 'photo'], ['Photo Enhanced', 'photo'],
        ['Digitizing', 'camera'], ['Photo Album Color', 'booklet'], ['Photo Restoration Album', 'booklet']] },
      { name: 'Film Printing', items: [['Film to Digital Printing', 'film']] },
    ],
  },
];

/* Rich data for the featured demo products. */
export const DETAILS: Record<string, SeedDetail> = {
  'business-cards': {
    price: 45, unit: '100 cards', turnaround: 'Same day', badge: 'Bestseller',
    desc: 'Premium business cards on 350–800gsm stocks with matte, gloss, soft-touch or spot-UV finishes. Rounded corners, foil and raised ink available.',
    options: { Size: ['Standard 9×5.5cm', 'Square 6.5cm', 'Mini 8.5×4cm'], Paper: ['350gsm Matte', '400gsm Soft-touch', '800gsm Triplex'], Finish: ['None', 'Spot UV', 'Gold Foil', 'Rounded Corners'] },
    qty: [100, 250, 500, 1000],
  },
  flyers: {
    price: 120, unit: '500 flyers', turnaround: '24 hours',
    desc: 'Full-colour flyers for launches, menus and promos. Single or double-sided, on silk, gloss or recycled stock.',
    options: { Size: ['A6', 'A5', 'A4', 'DL'], Paper: ['130gsm Gloss', '170gsm Silk', '250gsm Matte'], Sides: ['Single-sided', 'Double-sided'] },
    qty: [250, 500, 1000, 5000],
  },
  'roll-up-stands': {
    price: 180, unit: 'per stand', turnaround: '24 hours', badge: 'Events',
    desc: 'Aluminium roll-up banners with carry bag. Anti-curl PVC or premium fabric graphics that pop at exhibitions.',
    options: { Size: ['85×200cm', '100×200cm', '120×200cm'], Material: ['Anti-curl PVC', 'Fabric'], Base: ['Standard', 'Premium Wide'] },
    qty: [1, 2, 5, 10],
  },
  sticker: {
    price: 60, unit: '100 stickers', turnaround: 'Same day',
    desc: 'Die-cut, kiss-cut or sheet stickers in vinyl, paper, clear or holographic. Waterproof options for bottles and laptops.',
    options: { Shape: ['Circle', 'Square', 'Custom Die-cut'], Material: ['White Vinyl', 'Clear', 'Holographic', 'Paper'], Size: ['3cm', '5cm', '7cm', '10cm'] },
    qty: [50, 100, 500, 1000],
  },
  box: {
    price: 350, unit: '50 boxes', turnaround: '5–7 days', badge: 'New',
    desc: 'Custom rigid and folding boxes for retail, gifting and e-commerce. Printed inside and out, with foil and embossing.',
    options: { Style: ['Mailer', 'Tuck-end', 'Rigid Magnetic'], Material: ['Kraft', 'White Board', 'Rigid Card'], Finish: ['Matte Lam', 'Gloss Lam', 'Foil'] },
    qty: [50, 100, 250, 500],
  },
  'paper-bag': {
    price: 290, unit: '100 bags', turnaround: '5 days',
    desc: 'Branded paper bags with rope, twisted or ribbon handles. The walking billboard your customers carry home.',
    options: { Size: ['Small', 'Medium', 'Large'], Paper: ['Kraft', 'Art Paper 210gsm'], Handle: ['Twisted', 'Rope', 'Ribbon'] },
    qty: [100, 250, 500, 1000],
  },
  't-shirt-printing': {
    price: 25, unit: 'per piece', turnaround: '48 hours', badge: 'Bestseller',
    desc: 'DTF, screen and sublimation printing on cotton and dri-fit tees. Event teams, uniforms and merch drops.',
    options: { Fabric: ['100% Cotton', 'Dri-fit', 'Polo'], Print: ['DTF', 'Screen', 'Sublimation'], Placement: ['Front', 'Front + Back', 'Sleeve'] },
    qty: [10, 25, 50, 100],
  },
  'embroidery-cap': {
    price: 30, unit: 'per cap', turnaround: '3 days',
    desc: 'Flat and 3D puff embroidery on baseball, trucker and bucket caps. Crisp logos that never fade.',
    options: { Style: ['Baseball', 'Trucker', 'Bucket'], Embroidery: ['Flat', '3D Puff'], Color: ['Black', 'White', 'Navy', 'Beige'] },
    qty: [10, 25, 50, 100],
  },
  'mug-printing': {
    price: 22, unit: 'per mug', turnaround: 'Same day',
    desc: 'Full-wrap sublimation mugs, magic colour-changing mugs and enamel mugs. Perfect for teams and gifting.',
    options: { Type: ['Classic White', 'Magic Mug', 'Inner Colour', 'Enamel'], Print: ['Logo', 'Full Wrap', 'Photo'] },
    qty: [1, 12, 24, 50],
  },
  'corporate-kit': {
    price: 150, unit: 'per kit', turnaround: '5 days', badge: 'Corporate',
    desc: 'Welcome kits with notebook, pen, bottle, lanyard and more — all branded and packed in a custom box.',
    options: { Kit: ['Essentials (4 items)', 'Premium (6 items)', 'Executive (8 items)'], Packaging: ['Kraft Box', 'Black Rigid Box'] },
    qty: [10, 25, 50, 100],
  },
  'passport-size-photo': {
    price: 25, unit: '6 photos', turnaround: '10 minutes',
    desc: 'ICAO-compliant passport and ID photos for any country, shot and printed while you wait. Digital copy included.',
    options: { Country: ['UAE', 'India', 'Pakistan', 'UK', 'USA', 'Other'], Background: ['White', 'Light Blue', 'Grey'] },
    qty: [6, 12],
  },
  'photo-restoration': {
    price: 80, unit: 'per photo', turnaround: '3 days',
    desc: 'Torn, faded or water-damaged photos brought back to life by our retouch artists. Optional colourisation.',
    options: { Damage: ['Light', 'Medium', 'Heavy'], Output: ['Digital', 'Digital + Print'], Colorize: ['No', 'Yes'] },
    qty: [1, 5, 10, 25],
  },
};

export const DEFAULTS: Record<string, SeedDefault> = {
  printing: { price: 50, turnaround: '24–48 hours', options: { Size: ['Small', 'Medium', 'Large'], Finish: ['Matte', 'Gloss'] }, qty: [50, 100, 250, 500] },
  fabric: { price: 35, turnaround: '3–5 days', options: { Size: ['S', 'M', 'L', 'XL', 'XXL'], Method: ['Embroidery', 'Print'] }, qty: [10, 25, 50, 100] },
  gifts: { price: 40, turnaround: '2–4 days', options: { Personalisation: ['Logo', 'Name', 'Logo + Name'], Packaging: ['Standard', 'Gift Box'] }, qty: [1, 10, 25, 50] },
  photo: { price: 30, turnaround: 'Same day', options: { Output: ['Digital', 'Print', 'Digital + Print'] }, qty: [1, 2, 5, 10] },
};

