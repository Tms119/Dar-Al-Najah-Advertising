# Dar Al Najah Advertising — Product Catalogue & Data Plan

The full menu, based on the competitor reference (descoonline.com), arranged for **Dar Al Najah Advertising**.
All **95 products** are live in the Convex database (seeded from `web/convex/seedData.ts`) and are managed from the admin dashboard at `/admin`.
**12 are "featured"** and have full demo copy, options and pricing. The rest use sensible per-category defaults until the admin panel fills them in.

> Prices, turnaround times, phone, WhatsApp number, email, testimonials and stats in the demo are **placeholders**. Confirm them with the client before launch.

---

## 1. Menu structure (4 top-level categories)

| # | Category | Slug | Colour | Groups | Items |
|---|---|---|---|---|---|
| 1 | Printing Services | `printing` | `#2B3BFF` blue | Commercial Printing · Marketing & Promotional · Branded Packaging · Publishing | 32 |
| 2 | Fabric Printing | `fabric` | `#FF3D7F` pink | Embroidery & Textiles · Sportswear | 18 |
| 3 | Customised Gifts | `gifts` | `#F5A400` yellow | Gift Items · Customised Products · Gift Packaging · Gift Products | 31 |
| 4 | Photo Studio | `photo` | `#00A86B` green | Studio Services · Retouching · Film Printing | 14 |
| | **Total (unique)** | | | | **95** |

**Not built yet (in the competitor's nav):**
- **Signage**: the competitor links to a separate site. Decide whether to add it as a 5th category or link out.
- **Locations / branches**: a page with a map. Add it once the client gives the branch list.

**Duplicates removed:** the competitor lists some products under more than one menu. Each one is kept once, in its most natural category:
- Listed in both Fabric and Gifts on the competitor site: *T-Shirt Printing, Embroidery Shirts, Custom Patch, Embroidery Towel, Bathrobe, Table Cloths, Table Runner*. These live in **Fabric** here.
- *Photo Album* appears in both Gifts and Photo Studio. It lives in **Gifts** here.

In the database, use a **many-to-many** product ↔ category link so the admin can show one product in several menus. See the schema below.

---

## 2. Full product list

Legend: **★ full** = featured demo product with custom copy and options · **default** = uses the category's default options. Mockup = the illustrated SVG used until real photos are uploaded.

### Printing Services `printing` — 32 items

**Commercial Printing**

| Product | Slug | Mockup | Demo detail |
|---|---|---|---|
| Business Cards | `business-cards` | card | ★ full |
| Flyers | `flyers` | flyer | ★ full |
| Leaflet | `leaflet` | flyer | default |
| Poster | `poster` | poster | default |
| Wedding Card | `wedding-card` | card | default |
| Greeting Card | `greeting-card` | card | default |
| Booklet | `booklet` | booklet | default |
| Raised Printing | `raised-printing` | card | default |
| Catalog | `catalog` | booklet | default |
| Presentation Folders | `presentation-folders` | folder | default |
| Calendar | `calendar` | calendar | default |
| Letterhead | `letterhead` | flyer | default |
| Envelope | `envelope` | envelope | default |

**Marketing & Promotional**

| Product | Slug | Mockup | Demo detail |
|---|---|---|---|
| NFC Card | `nfc-card` | card | default |
| PVC ID Card | `pvc-id-card` | badge | default |
| Banner | `banner` | banner | default |
| Roll-up Stands | `roll-up-stands` | rollup | ★ full |
| Pop-up Stands | `pop-up-stands` | rollup | default |
| X-Stands | `x-stands` | rollup | default |
| Sticker | `sticker` | sticker | ★ full |
| Postcard | `postcard` | card | default |
| Gift Voucher | `gift-voucher` | card | default |
| Coupon | `coupon` | card | default |
| Magnet | `magnet` | sticker | default |

**Branded Packaging**

| Product | Slug | Mockup | Demo detail |
|---|---|---|---|
| Box | `box` | box | ★ full |
| Paper Bag | `paper-bag` | bag | ★ full |
| Product Label | `product-label` | sticker | default |
| Hang Tag | `hang-tag` | tag | default |

**Publishing**

| Product | Slug | Mockup | Demo detail |
|---|---|---|---|
| Bookmark | `bookmark` | tag | default |
| Magazine | `magazine` | booklet | default |
| Journal | `journal` | notebook | default |
| Manual | `manual` | booklet | default |

### Fabric Printing `fabric` — 18 items

**Embroidery & Textiles**

| Product | Slug | Mockup | Demo detail |
|---|---|---|---|
| Embroidery Shirts | `embroidery-shirts` | shirt | default |
| Embroidery Hoodie | `embroidery-hoodie` | hoodie | default |
| Custom Patch | `custom-patch` | patch | default |
| Abaya Embroidery | `abaya-embroidery` | abaya | default |
| Fashion Embroidery | `fashion-embroidery` | shirt | default |
| Embroidery Cap | `embroidery-cap` | cap | ★ full |
| Embroidery Towel | `embroidery-towel` | towel | default |
| Bathrobe | `bathrobe` | abaya | default |
| Custom Apron | `custom-apron` | apron | default |
| Table Cloths | `table-cloths` | towel | default |
| Table Runner | `table-runner` | towel | default |

**Sportswear**

| Product | Slug | Mockup | Demo detail |
|---|---|---|---|
| Tracksuit Jacket | `tracksuit-jacket` | hoodie | default |
| Sports Jersey | `sports-jersey` | shirt | default |
| Long Sleeve | `long-sleeve` | shirt | default |
| Sports Shorts | `sports-shorts` | shorts | default |
| Half Sleeve | `half-sleeve` | shirt | default |
| Crop Top | `crop-top` | shirt | default |
| T-Shirt Printing | `t-shirt-printing` | shirt | ★ full |

### Customised Gifts `gifts` — 31 items

**Gift Items**

| Product | Slug | Mockup | Demo detail |
|---|---|---|---|
| Hoodie Printing | `hoodie-printing` | hoodie | default |
| Engraving Greeting Cards | `engraving-greeting-cards` | card | default |
| Engraving Business Cards | `engraving-business-cards` | card | default |
| 3D Cube Engraving | `3d-cube-engraving` | cube | default |
| Cap Printing | `cap-printing` | cap | default |
| Engraving Notebook | `engraving-notebook` | notebook | default |

**Customised Products**

| Product | Slug | Mockup | Demo detail |
|---|---|---|---|
| Photo Album | `photo-album` | booklet | default |
| Pillow Cover | `pillow-cover` | pillow | default |
| Safety Jacket | `safety-jacket` | vest | default |
| Safety Helmet | `safety-helmet` | helmet | default |
| Safety Coverall | `safety-coverall` | vest | default |
| UV Printing Bottle | `uv-printing-bottle` | bottle | default |
| Print on Ceramics | `print-on-ceramics` | mug | default |
| Engraving Plates | `engraving-plates` | plate | default |
| Cutlery Engraving | `cutlery-engraving` | pen | default |
| Knife Engraving | `knife-engraving` | pen | default |
| Pen Engraving | `pen-engraving` | pen | default |
| Wooden Engraving | `wooden-engraving` | plate | default |
| Key Duplication | `key-duplication` | keychain | default |

**Gift Packaging**

| Product | Slug | Mockup | Demo detail |
|---|---|---|---|
| Gift Wrapping | `gift-wrapping` | box | default |
| Name Plate | `name-plate` | plate | default |
| Key Chain | `key-chain` | keychain | default |
| Custom Flag | `custom-flag` | flag | default |
| Custom Ribbon | `custom-ribbon` | ribbon | default |
| Lanyard | `lanyard` | lanyard | default |

**Gift Products**

| Product | Slug | Mockup | Demo detail |
|---|---|---|---|
| USB | `usb` | usb | default |
| Corporate Kit | `corporate-kit` | box | ★ full |
| Name Badge | `name-badge` | badge | default |
| Mug Printing | `mug-printing` | mug | ★ full |
| Notebook Printing | `notebook-printing` | notebook | default |
| Puzzles Printing | `puzzles-printing` | puzzle | default |

### Photo Studio `photo` — 14 items

**Studio Services**

| Product | Slug | Mockup | Demo detail |
|---|---|---|---|
| Passport Size Photo | `passport-size-photo` | photo | ★ full |
| International Visa | `international-visa` | photo | default |
| Schengen Visa | `schengen-visa` | photo | default |
| Baby Infant ID | `baby-infant-id` | photo | default |
| Profile Shoot | `profile-shoot` | camera | default |
| Family Photoshoot | `family-photoshoot` | camera | default |

**Retouching**

| Product | Slug | Mockup | Demo detail |
|---|---|---|---|
| Retouching | `retouching` | photo | default |
| Colorization | `colorization` | photo | default |
| Photo Restoration | `photo-restoration` | photo | ★ full |
| Photo Enhanced | `photo-enhanced` | photo | default |
| Digitizing | `digitizing` | camera | default |
| Photo Album Color | `photo-album-color` | booklet | default |
| Photo Restoration Album | `photo-restoration-album` | booklet | default |

**Film Printing**

| Product | Slug | Mockup | Demo detail |
|---|---|---|---|
| Film to Digital Printing | `film-to-digital-printing` | film | default |


---

## 3. Database schema (proposed)

Built to drop in behind the existing UI. Every field the site reads today maps to a column.

```
categories
  id            uuid  pk
  slug          text  unique          -- "printing"
  name          text                  -- "Printing Services"
  short_name    text                  -- "Printing" (nav pill)
  tagline       text
  color         text                  -- "#2B3BFF"
  tint          text                  -- "#E6E8FF" (card background)
  sort_order    int
  is_active     bool

groups                                -- sub-headings inside a category
  id            uuid  pk
  category_id   fk → categories
  name          text                  -- "Commercial Printing"
  sort_order    int

products
  id            uuid  pk
  slug          text  unique          -- "business-cards"
  name          text
  description   text
  base_price    numeric               -- AED, "from" price
  price_unit    text                  -- "100 cards"
  turnaround    text                  -- "Same day"
  badge         text  null            -- "Bestseller" | "New" | ...
  mockup_shape  text                  -- fallback illustration until photos exist
  is_featured   bool
  is_active     bool
  sort_order    int
  seo_title     text
  seo_desc      text
  created_at / updated_at

product_groups                        -- many-to-many (product can sit in several menus)
  product_id    fk → products
  group_id      fk → groups
  is_primary    bool                  -- drives breadcrumb + colour

product_images
  id, product_id, url, alt, sort_order

product_options                       -- "Size", "Paper", "Finish"…
  id, product_id, name, sort_order

product_option_values                 -- "A5", "350gsm Matte"…
  id, option_id, label, price_modifier numeric (% or AED), sort_order

product_quantity_tiers                -- 100 / 250 / 500 / 1000
  id, product_id, quantity int, price numeric

quote_requests                        -- from product page + contact form
  id, product_id null, selections jsonb, quantity, est_price,
  name, email, phone, company, message, artwork_url,
  status ('new' | 'quoted' | 'won' | 'lost'), created_at
```

## 4. Admin panel: features to build

1. **Categories & groups**: create, rename, reorder (drag), recolour, hide.
2. **Products**: create/edit with name, slug (auto), description, price, unit, turnaround, badge, featured toggle and active toggle.
   - Assign to one or more groups, and pick the primary one.
   - **Image upload** with drag-to-reorder. The SVG mockup is the fallback when there are no images.
   - **Options builder**: add option groups and values, with a price modifier on each value.
   - **Quantity tiers**: a quantity → price table. This replaces the demo multiplier.
3. **Bulk import**: seed all 95 products from this file or a CSV in one click.
4. **Quote inbox**: list and filter quote requests, download artwork, change status, and reply via WhatsApp or email.
5. **Site settings**: phone, WhatsApp number, email, address, opening hours, social links, and the homepage marquee text.
6. **Auth**: admin login with roles (owner / staff).

## 5. Suggested stack for phase 2

- **Next.js** (already used): Route Handlers or Server Actions for the API.
- **Postgres** through Supabase or Neon, with **Prisma** or Drizzle as the ORM.
- **Storage** for product images and uploaded artwork: Supabase Storage, S3 or Cloudflare R2.
- **Auth**: NextAuth or Supabase Auth.
- **Email**: Resend for quote notifications.

**Status:** implemented on Convex instead of Postgres. See `web/convex/schema.ts` (tables), `web/convex/catalog.ts` (public live queries) and `web/convex/admin.ts` (admin-only mutations). Options and quantity tiers are stored on the product document; images use Convex file storage.
