/* Starter catalogue used once to seed the database (convex/seed.ts).
   After seeding, the admin dashboard is the source of truth. */

export type SeedCategory = {
  id: string; name: string; short: string; tagline: string; color: string; tint: string; hero: string;
  groups: { name: string; items: [string, string][] }[];
};
export type SeedDetail = { badge?: string; desc: string };

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

/* Descriptions (and badges) for the featured demo products. */
export const DETAILS: Record<string, SeedDetail> = {
  'business-cards': {
    badge: 'Bestseller',
    desc: 'Premium business cards on 350–800gsm stocks with matte, gloss, soft-touch or spot-UV finishes. Rounded corners, foil and raised ink available.',
  },
  flyers: {
    desc: 'Full-colour flyers for launches, menus and promos. Single or double-sided, on silk, gloss or recycled stock.',
  },
  'roll-up-stands': {
    badge: 'Events',
    desc: 'Aluminium roll-up banners with carry bag. Anti-curl PVC or premium fabric graphics that pop at exhibitions.',
  },
  sticker: {
    desc: 'Die-cut, kiss-cut or sheet stickers in vinyl, paper, clear or holographic. Waterproof options for bottles and laptops.',
  },
  box: {
    badge: 'New',
    desc: 'Custom rigid and folding boxes for retail, gifting and e-commerce. Printed inside and out, with foil and embossing.',
  },
  'paper-bag': {
    desc: 'Branded paper bags with rope, twisted or ribbon handles. The walking billboard your customers carry home.',
  },
  't-shirt-printing': {
    badge: 'Bestseller',
    desc: 'DTF, screen and sublimation printing on cotton and dri-fit tees. Event teams, uniforms and merch drops.',
  },
  'embroidery-cap': {
    desc: 'Flat and 3D puff embroidery on baseball, trucker and bucket caps. Crisp logos that never fade.',
  },
  'mug-printing': {
    desc: 'Full-wrap sublimation mugs, magic colour-changing mugs and enamel mugs. Perfect for teams and gifting.',
  },
  'corporate-kit': {
    badge: 'Corporate',
    desc: 'Welcome kits with notebook, pen, bottle, lanyard and more — all branded and packed in a custom box.',
  },
  'passport-size-photo': {
    desc: 'ICAO-compliant passport and ID photos for any country, shot and printed while you wait. Digital copy included.',
  },
  'photo-restoration': {
    desc: 'Torn, faded or water-damaged photos brought back to life by our retouch artists. Optional colourisation.',
  },
};
