import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { slugify } from "./seedData";
import { DEFAULT_MODEL, runModel, sniffType } from "./lib/imageModel";

/* One-time setup of the Woven Labels category (landing page: /woven-labels).
   After it runs, everything is edited in the admin like any other product.
     npx convex run wovenLabels:setup
     npx convex run wovenLabels:generateImages   (product photos, Cloudflare AI)
     npx convex run wovenLabels:generateImages '{"redo":["damask-woven-labels"]}'   (replace one) */

export const CATEGORY = {
  slug: "woven-labels",
  name: "Woven Labels",
  shortName: "Woven Labels",
  tagline: "Custom woven labels for clothing, caps, bags and uniforms, woven in Dubai to your exact brand colours.",
  color: "#7B3FE4",
  tint: "#EFE7FF",
  heroShape: "tag",
};

type Item = { name: string; desc: string; photo: string; badge?: string };

/* `photo` describes the product shot generated for each item. */
export const GROUPS: { name: string; items: Item[] }[] = [
  {
    name: "Label types",
    items: [
      {
        name: "Custom Woven Labels",
        badge: "Popular",
        desc: "Your logo, brand name and colours woven into a label made only for your brand. Choose the size, shape, fold and finish, and we match the thread colours to your brand guide.",
        photo: "three custom woven clothing labels in black, cream and navy, reading NOVA, LUXE and ATLAS in clean woven capital letters, arranged in a neat row on a light linen surface",
      },
      {
        name: "Damask Woven Labels",
        desc: "Our finest weave. Dense damask threads give crisp lettering, tiny logo details and a smooth premium feel, ideal for fashion and luxury labels.",
        photo: "a close up of a premium black damask woven clothing label with the single word LUXE woven in ivory serif letters and a small crest, extremely detailed tight weave texture, resting on folded brown wool fabric",
      },
      {
        name: "Satin Woven Labels",
        desc: "Soft, glossy satin with a gentle sheen that feels smooth against the skin. A favourite for baby wear, lingerie, scarves and evening wear.",
        photo: "a glossy ivory satin woven clothing label with a small gold woven script logo, light reflecting on the satin sheen, lying on a folded navy cotton shirt",
      },
      {
        name: "Polyester Woven Labels",
        desc: "Strong, colourfast and built for the washing machine. Polyester labels keep their colour and shape wash after wash, perfect for everyday clothing and workwear.",
        photo: "several durable navy blue polyester woven labels, each showing only the word ATLAS in bright white woven capital letters, crisp edges, stacked on a grey cotton t shirt",
      },
      {
        name: "Cotton Woven Labels",
        desc: "Natural cotton labels with a soft, matte, handmade look. A great match for organic, sustainable and artisan brands.",
        photo: "a natural undyed cotton woven label with only a small brown woven leaf icon and no words, matte organic texture, on raw beige canvas with a sprig of dried cotton",
      },
    ],
  },
  {
    name: "Folds and finishes",
    items: [
      {
        name: "Center Fold Woven Labels",
        desc: "Folded in the middle and stitched into a seam, with your brand on the front and size or care details on the back. The classic neck label.",
        photo: "a center fold woven label folded in half and sewn into the neck seam of a white shirt, showing only the word NOVA in black woven capital letters, macro detail of the stitching",
      },
      {
        name: "End Fold Woven Labels",
        desc: "Both ends are folded under so the label sits flat and is sewn along the edges. A clean, tidy finish for side seams, pockets and outerwear.",
        photo: "an end fold woven label with both short ends folded under, sewn flat onto the inside of a denim jacket, close up product photo",
      },
      {
        name: "Straight Cut Woven Labels",
        desc: "Cut straight with no folds, ready to be sewn on all four sides or bonded with an iron on backing. Simple, flat and versatile.",
        photo: "a set of flat straight cut rectangular woven clothing labels in black, cream and navy with short woven brand names such as NOVA and LUXE, clean cut ends, laid out in a neat grid on white card",
      },
      {
        name: "Soft Edge Woven Labels",
        desc: "Smoothly sealed edges that never scratch or fray. Comfortable on the neck and ideal for sportswear and anything worn close to the skin.",
        photo: "a soft edge woven label with smooth rounded sealed edges on the inside collar of a soft athletic top, macro detail showing smooth edges",
      },
    ],
  },
  {
    name: "Labels by product",
    items: [
      {
        name: "Woven Labels for Garments",
        desc: "Brand, size and care labels for every garment you make, from dresses and abayas to trousers and jackets, woven to survive repeated washing.",
        photo: "a clothing rack of folded garments with woven brand labels visible on the inside necklines, boutique studio lighting",
      },
      {
        name: "Woven Labels for T-Shirts",
        desc: "Soft neck and hem labels that turn a plain tee into a branded product. Perfect for merch drops, event shirts and clothing startups.",
        photo: "a stack of folded cotton t shirts in black, white and sand, each with a woven brand label at the neck, top view product photo",
      },
      {
        name: "Woven Labels for Caps",
        desc: "Small, sturdy labels for the back strap or inside band of caps and hats. Woven sharp enough to read at a tiny size.",
        photo: "a black baseball cap seen from the back with a small woven brand label stitched next to the strap, studio product photo",
      },
      {
        name: "Woven Labels for Bags",
        desc: "Durable labels for tote bags, backpacks, pouches and leather goods. Sewn on the outside as a feature or inside as a signature.",
        photo: "a canvas tote bag and a leather pouch each with a woven brand label sewn on the front, styled flat lay on a warm wooden table",
      },
      {
        name: "Woven Labels for Uniforms",
        desc: "Hard wearing labels for corporate, hospitality, school and medical uniforms that stay readable through industrial washing.",
        photo: "a folded corporate uniform shirt and chef jacket with woven company labels on the chest pocket and collar, clean studio photo",
      },
    ],
  },
  {
    name: "Manufacturing and supply",
    items: [
      {
        name: "Woven Label Manufacturer",
        desc: "We design, weave and finish labels for brands across the UAE, from the first sample to the final carton, with a proof before every production run.",
        photo: "a modern label weaving workshop with spools of coloured thread and a roll of freshly woven labels coming off a loom, warm industrial light",
      },
      {
        name: "Woven Label Factory",
        desc: "Production capacity for brands that grow fast: consistent colours, repeat orders that match the first batch, and reliable delivery dates.",
        photo: "rolls of woven labels on spools and cut labels in bins on a factory worktable, rows of thread cones in the background",
      },
      {
        name: "Clothing Label Supplier",
        desc: "One supplier for every label your clothing needs: woven brand labels, size labels, care labels and hang tags, so your range stays consistent.",
        photo: "an assortment of clothing labels arranged neatly in a flat lay on white: woven brand labels showing only the word LUXE, small size labels showing S, M and L, and plain care labels with washing symbols",
      },
      {
        name: "Bulk Woven Labels",
        desc: "Large runs at better prices per label. Ideal for established brands, seasonal collections and uniform programmes.",
        photo: "a large roll of identical navy woven labels, each with only a small white woven star icon and no words, unspooling across a table next to a cardboard box filled with cut labels",
      },
      {
        name: "Wholesale Woven Labels",
        desc: "Wholesale supply for garment makers, tailors and retailers who need labels for many brands, with dependable repeat production.",
        photo: "several stacks of woven labels for different brands tied with string and labelled, in a tidy wholesale storeroom",
      },
      {
        name: "Private Label Woven Labels",
        desc: "Launching your own clothing line? We weave labels under your brand name, so products made for you carry your identity, not the maker's.",
        photo: "a minimalist clothing brand flat lay with a folded sweater and a premium woven private label in the foreground, beige and white tones",
      },
      {
        name: "OEM Woven Labels",
        desc: "Labels produced to your exact specification for OEM and contract manufacturing, matched to your artwork, colours and quality standards.",
        photo: "a technical flat lay of woven label samples next to a colour swatch card and a printed specification sheet on a light desk",
      },
    ],
  },
];

const PHOTO_STYLE =
  "Professional photorealistic product photography, sharp focus, soft natural studio light, high detail, no watermark, no people. Any lettering is spelled exactly as given and no other words appear anywhere.";
const HERO_PHOTO =
  "an overhead flat lay of many colourful custom woven clothing labels, damask and satin, scattered on cream linen with thread spools and scissors";

/** Creates the category, its groups and the 21 products. Does nothing if it already exists. */
export const setup = internalMutation({
  args: {},
  returns: v.object({ skipped: v.boolean(), products: v.number() }),
  handler: async (ctx) => {
    const existing = await ctx.db.query("categories").withIndex("by_slug", (q) => q.eq("slug", CATEGORY.slug)).unique();
    if (existing) return { skipped: true, products: 0 };

    const cats = await ctx.db.query("categories").take(50);
    const categoryId = await ctx.db.insert("categories", {
      ...CATEGORY,
      imageId: null,
      isActive: true,
      sortOrder: cats.reduce((m, c) => Math.max(m, c.sortOrder), -1) + 1,
    });
    const [lastProduct] = await ctx.db.query("products").order("desc").take(1);
    let productOrder = (lastProduct?.sortOrder ?? -1) + 1;
    let count = 0;

    for (const [gi, group] of GROUPS.entries()) {
      const groupId = await ctx.db.insert("groups", { categoryId, name: group.name, sortOrder: gi });
      for (const [pi, item] of group.items.entries()) {
        const slug = slugify(item.name);
        const found = await ctx.db.query("products").withIndex("by_slug", (q) => q.eq("slug", slug)).unique();
        const productId: Id<"products"> = found?._id ?? await ctx.db.insert("products", {
          slug,
          name: item.name,
          description: item.desc,
          badge: item.badge ?? null,
          mockupShape: "tag",
          imageIds: [],
          isFeatured: false,
          isActive: true,
          sortOrder: productOrder++,
        });
        await ctx.db.insert("productGroups", { productId, groupId, isPrimary: !found, sortOrder: pi });
        count++;
      }
    }
    return { skipped: false, products: count };
  },
});

/** Copies the category's name, menu label and tagline from CATEGORY above
    (for deployments set up before a wording change). */
export const syncCategory = internalMutation({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => {
    const cat = await ctx.db.query("categories").withIndex("by_slug", (q) => q.eq("slug", CATEGORY.slug)).unique();
    if (!cat) return false;
    await ctx.db.patch(cat._id, { name: CATEGORY.name, shortName: CATEGORY.shortName, tagline: CATEGORY.tagline });
    return true;
  },
});

/* ---------- product photos ---------- */

export const missingImages = internalQuery({
  args: { redo: v.array(v.string()) },
  handler: async (ctx, { redo }) => {
    const cat = await ctx.db.query("categories").withIndex("by_slug", (q) => q.eq("slug", CATEGORY.slug)).unique();
    if (!cat) return null;
    const products = [];
    for (const group of GROUPS) {
      for (const item of group.items) {
        const p = await ctx.db.query("products").withIndex("by_slug", (q) => q.eq("slug", slugify(item.name))).unique();
        if (p && (p.imageIds.length === 0 || redo.includes(p.slug))) products.push({ id: p._id, photo: item.photo });
      }
    }
    return { categoryId: cat._id, categoryNeedsImage: !cat.imageId, products };
  },
});

export const attachImage = internalMutation({
  args: { storageId: v.id("_storage"), productId: v.union(v.id("products"), v.null()), categoryId: v.union(v.id("categories"), v.null()) },
  returns: v.null(),
  handler: async (ctx, { storageId, productId, categoryId }) => {
    if (productId) {
      const p = await ctx.db.get(productId);
      if (!p) await ctx.storage.delete(storageId);
      else {
        await Promise.all(p.imageIds.map((old) => ctx.storage.delete(old)));
        await ctx.db.patch(productId, { imageIds: [storageId] });
      }
    }
    if (categoryId) await ctx.db.patch(categoryId, { imageId: storageId });
    return null;
  },
});

/** Generates a photo for every woven label product (and the category) that has none.
    Safe to re-run: items that already have a photo are skipped, unless their
    slug is listed in `redo` (then the photo is replaced). */
export const generateImages = internalAction({
  args: { limit: v.optional(v.number()), redo: v.optional(v.array(v.string())) },
  returns: v.object({ made: v.number(), failed: v.array(v.string()) }),
  handler: async (ctx, { limit, redo }) => {
    const todo = await ctx.runQuery(internal.wovenLabels.missingImages, { redo: redo ?? [] });
    if (!todo) throw new Error("Run wovenLabels:setup first");
    const jobs: { photo: string; productId: Id<"products"> | null; categoryId: Id<"categories"> | null }[] = [
      ...(todo.categoryNeedsImage ? [{ photo: HERO_PHOTO, productId: null, categoryId: todo.categoryId }] : []),
      ...todo.products.map((p) => ({ photo: p.photo, productId: p.id, categoryId: null })),
    ].slice(0, limit ?? 50);

    let made = 0;
    const failed: string[] = [];
    for (const job of jobs) {
      try {
        const bytes = await runModel(DEFAULT_MODEL, `${PHOTO_STYLE} ${job.photo}.`, [], 1024, 1024);
        const storageId = await ctx.storage.store(new Blob([bytes], { type: sniffType(bytes) }));
        await ctx.runMutation(internal.wovenLabels.attachImage, { storageId, productId: job.productId, categoryId: job.categoryId });
        made++;
      } catch (e) {
        failed.push(`${job.photo.slice(0, 40)}…: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    return { made, failed };
  },
});
