import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery, type MutationCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { slugify } from "./seedData";
import { runPhotoModel, sniffType } from "./lib/imageModel";
import { SEEDS } from "./lib/seeds";
import type { SeedItem } from "./lib/seeds/types";
import { CATEGORY_PROMPTS, PHOTO_PROMPTS } from "./lib/seeds/photoPrompts";
import { EXTRA_PRODUCTS } from "./lib/seeds/extraProducts";
import { CATEGORY_ORDER, LINKED_CATEGORIES } from "./lib/seeds/linkedCategories";

/* Category setup from starter content (convex/lib/seeds). After setup,
   everything is edited in the admin like any other category. CLI only:
     npx convex run catalogSeeds:setup '{"slug":"stickers"}'
     npx convex run catalogSeeds:generateImages '{"slug":"stickers"}'
     npx convex run catalogSeeds:generateImages '{"slug":"stickers","redo":["car-stickers"]}'
     npx convex run catalogSeeds:syncGroups '{"slug":"stickers"}'   (add new starter groups)
     npx convex run catalogSeeds:removeCategory '{"slug":"photo"}' */

/* For products without written photo prompts. Asks for no text at all,
   because image models garble any words they try to print. */
const GENERIC_STYLE =
  "Professional photorealistic product photography on a clean light studio background, soft natural light, sharp focus, high detail, no people. Absolutely no text, no letters, no numbers, no logos, no writing of any kind anywhere in the image.";

const SCENE_STYLE =
  "Professional photorealistic product photography, natural light, shallow depth of field, sharp focus on the product, high detail, no faces. No words, letters or writing anywhere; designs are logo marks, patterns or illustrations only.";

const PHOTO_STYLE =
  "Professional photorealistic product photography, sharp focus, soft natural studio light, high detail, no watermark, no people. Any lettering is spelled exactly as given and no other words appear anywhere.";

function seedFor(slug: string) {
  const seed = SEEDS[slug];
  if (!seed) throw new Error(`No starter content for "${slug}". Known: ${Object.keys(SEEDS).join(", ")}`);
  return seed;
}

const categoryBySlug = (ctx: MutationCtx, slug: string) =>
  ctx.db.query("categories").withIndex("by_slug", (q) => q.eq("slug", slug)).unique();

/** Adds the items to a group (reusing a product that already exists by slug). */
async function addProducts(ctx: MutationCtx, groupId: Id<"groups">, items: SeedItem[], shape: string) {
  const [lastProduct] = await ctx.db.query("products").order("desc").take(1);
  let productOrder = (lastProduct?.sortOrder ?? -1) + 1;
  for (const [pi, item] of items.entries()) {
    const productSlug = slugify(item.name);
    const found = await ctx.db.query("products").withIndex("by_slug", (q) => q.eq("slug", productSlug)).unique();
    const productId: Id<"products"> = found?._id ?? await ctx.db.insert("products", {
      slug: productSlug,
      name: item.name,
      description: item.desc,
      badge: item.badge ?? null,
      mockupShape: shape,
      imageIds: [],
      isFeatured: false,
      isActive: true,
      sortOrder: productOrder++,
    });
    await ctx.db.insert("productGroups", { productId, groupId, isPrimary: !found, sortOrder: pi });
  }
  return items.length;
}

/** Creates the category, its groups and products. Does nothing if it already exists. */
export const setup = internalMutation({
  args: { slug: v.string() },
  returns: v.object({ skipped: v.boolean(), products: v.number() }),
  handler: async (ctx, { slug }) => {
    const seed = seedFor(slug);
    if (await categoryBySlug(ctx, slug)) return { skipped: true, products: 0 };

    const cats = await ctx.db.query("categories").take(50);
    const categoryId = await ctx.db.insert("categories", {
      ...seed.category,
      imageId: null,
      isActive: true,
      sortOrder: cats.reduce((m, c) => Math.max(m, c.sortOrder), -1) + 1,
    });
    let count = 0;
    for (const [gi, group] of seed.groups.entries()) {
      const groupId = await ctx.db.insert("groups", { categoryId, name: group.name, sortOrder: gi });
      count += await addProducts(ctx, groupId, group.items, seed.shape);
    }
    return { skipped: false, products: count };
  },
});

/** For a category that already exists: adds starter groups it doesn't have yet
    (with their products) and puts all starter groups in starter order, so new
    groups can be placed at the top. Groups added in the admin go after them. */
export const syncGroups = internalMutation({
  args: { slug: v.string() },
  returns: v.object({ groupsAdded: v.array(v.string()), products: v.number() }),
  handler: async (ctx, { slug }) => {
    const seed = seedFor(slug);
    const cat = await categoryBySlug(ctx, slug);
    if (!cat) throw new Error(`Run catalogSeeds:setup for "${slug}" first`);
    const existing = await ctx.db.query("groups").withIndex("by_categoryId_and_sortOrder", (q) => q.eq("categoryId", cat._id)).take(100);
    const byName = new Map(existing.map((g) => [g.name, g]));
    const groupsAdded: string[] = [];
    let products = 0;
    for (const [gi, group] of seed.groups.entries()) {
      const found = byName.get(group.name);
      if (found) {
        await ctx.db.patch(found._id, { sortOrder: gi });
        continue;
      }
      const groupId = await ctx.db.insert("groups", { categoryId: cat._id, name: group.name, sortOrder: gi });
      products += await addProducts(ctx, groupId, group.items, seed.shape);
      groupsAdded.push(group.name);
    }
    // groups made in the admin keep their order, after the starter ones
    const extra = existing.filter((g) => !seed.groups.some((sg) => sg.name === g.name));
    for (const [i, g] of extra.entries()) await ctx.db.patch(g._id, { sortOrder: seed.groups.length + i });
    return { groupsAdded, products };
  },
});

/** Copies the category's name, menu label and tagline from its starter content. */
export const syncCategory = internalMutation({
  args: { slug: v.string() },
  returns: v.boolean(),
  handler: async (ctx, { slug }) => {
    const { category } = seedFor(slug);
    const cat = await categoryBySlug(ctx, slug);
    if (!cat) return false;
    await ctx.db.patch(cat._id, { name: category.name, shortName: category.shortName, tagline: category.tagline });
    return true;
  },
});

/** Removes a category: its photo, groups and menu links, and every product
    that appears only in this category (with its photos). Products that are
    also listed in another category are kept, and get a new primary group. */
export const removeCategory = internalMutation({
  args: { slug: v.string() },
  returns: v.object({ removed: v.boolean(), groups: v.number(), productsDeleted: v.number(), productsKept: v.array(v.string()) }),
  handler: async (ctx, { slug }) => {
    const cat = await categoryBySlug(ctx, slug);
    if (!cat) return { removed: false, groups: 0, productsDeleted: 0, productsKept: [] };

    const groups = await ctx.db.query("groups").withIndex("by_categoryId_and_sortOrder", (q) => q.eq("categoryId", cat._id)).take(100);
    const productIds = new Set<Id<"products">>();
    for (const g of groups) {
      const links = await ctx.db.query("productGroups").withIndex("by_groupId_and_sortOrder", (q) => q.eq("groupId", g._id)).take(1000);
      for (const l of links) {
        productIds.add(l.productId);
        await ctx.db.delete(l._id);
      }
      await ctx.db.delete(g._id);
    }

    let productsDeleted = 0;
    const productsKept: string[] = [];
    for (const pid of productIds) {
      const p = await ctx.db.get(pid);
      if (!p) continue;
      const others = await ctx.db.query("productGroups").withIndex("by_productId", (q) => q.eq("productId", pid)).take(20);
      if (others.length === 0) {
        await Promise.all(p.imageIds.map((img) => ctx.storage.delete(img)));
        await ctx.db.delete(pid);
        productsDeleted++;
      } else {
        if (!others.some((l) => l.isPrimary)) await ctx.db.patch(others[0]._id, { isPrimary: true });
        productsKept.push(p.slug);
      }
    }

    if (cat.imageId) await ctx.storage.delete(cat.imageId);
    await ctx.db.delete(cat._id);
    return { removed: true, groups: groups.length, productsDeleted, productsKept };
  },
});

/* ---------- product photos ---------- */

export const missingImages = internalQuery({
  args: { slug: v.string(), redo: v.array(v.string()) },
  returns: v.union(v.null(), v.object({
    categoryId: v.id("categories"),
    categoryNeedsImage: v.boolean(),
    heroPhoto: v.string(),
    products: v.array(v.object({ id: v.id("products"), photo: v.string() })),
  })),
  handler: async (ctx, { slug, redo }) => {
    const seed = seedFor(slug);
    const cat = await ctx.db.query("categories").withIndex("by_slug", (q) => q.eq("slug", slug)).unique();
    if (!cat) return null;
    const products = [];
    for (const group of seed.groups) {
      for (const item of group.items) {
        const p = await ctx.db.query("products").withIndex("by_slug", (q) => q.eq("slug", slugify(item.name))).unique();
        if (p && (p.imageIds.length === 0 || redo.includes(p.slug))) products.push({ id: p._id, photo: item.photo });
      }
    }
    return { categoryId: cat._id, categoryNeedsImage: !cat.imageId || redo.includes("category"), heroPhoto: seed.heroPhoto, products };
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
    if (categoryId) {
      const cat = await ctx.db.get(categoryId);
      if (cat?.imageId && cat.imageId !== storageId) await ctx.storage.delete(cat.imageId);
      await ctx.db.patch(categoryId, { imageId: storageId });
    }
    return null;
  },
});

/** Generates a photo for every product (and the category) in the category that
    has none. Safe to re-run: products with a photo are skipped unless listed in
    `redo` by slug ("category" redoes the cover photo). */
export const generateImages = internalAction({
  args: { slug: v.string(), limit: v.optional(v.number()), redo: v.optional(v.array(v.string())) },
  returns: v.object({ made: v.number(), failed: v.array(v.string()) }),
  handler: async (ctx, { slug, limit, redo }): Promise<{ made: number; failed: string[] }> => {
    const todo: {
      categoryId: Id<"categories">; categoryNeedsImage: boolean; heroPhoto: string;
      products: { id: Id<"products">; photo: string }[];
    } | null = await ctx.runQuery(internal.catalogSeeds.missingImages, { slug, redo: redo ?? [] });
    if (!todo) throw new Error(`Run catalogSeeds:setup for "${slug}" first`);
    const jobs: { photo: string; productId: Id<"products"> | null; categoryId: Id<"categories"> | null }[] = [
      ...(todo.categoryNeedsImage ? [{ photo: todo.heroPhoto, productId: null, categoryId: todo.categoryId }] : []),
      ...todo.products.map((p) => ({ photo: p.photo, productId: p.id, categoryId: null })),
    ].slice(0, limit ?? 50);

    let made = 0;
    const failed: string[] = [];
    for (const job of jobs) {
      try {
        const bytes = await runPhotoModel(`${PHOTO_STYLE} ${job.photo}.`);
        const storageId = await ctx.storage.store(new Blob([bytes], { type: sniffType(bytes) }));
        await ctx.runMutation(internal.catalogSeeds.attachImage, { storageId, productId: job.productId, categoryId: job.categoryId });
        made++;
      } catch (e) {
        failed.push(`${job.photo.slice(0, 40)}…: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    return { made, failed };
  },
});

/* ---------- photos for any product without one ---------- */

/** Active products with no photo, with their primary category and group names. */
export const productsWithoutPhotos = internalQuery({
  args: { redo: v.optional(v.array(v.string())) },
  returns: v.array(v.object({
    id: v.id("products"), slug: v.string(), name: v.string(), description: v.string(), group: v.string(), category: v.string(),
  })),
  handler: async (ctx, { redo = [] }) => {
    const products = await ctx.db.query("products").take(1000);
    const out = [];
    for (const p of products) {
      if (!p.isActive || (p.imageIds.length && !redo.includes(p.slug))) continue;
      const links = await ctx.db.query("productGroups").withIndex("by_productId", (q) => q.eq("productId", p._id)).take(10);
      const link = links.find((l) => l.isPrimary) ?? links[0];
      const group = link ? await ctx.db.get(link.groupId) : null;
      const cat = group ? await ctx.db.get(group.categoryId) : null;
      out.push({ id: p._id, slug: p.slug, name: p.name, description: p.description, group: group?.name ?? "", category: cat?.name ?? "" });
    }
    return out;
  },
});

/** Generates a photo for up to `limit` products that have none, built from the
    product's name and description. Re-run until `remaining` is 0. */
export const generateMissingPhotos = internalAction({
  args: { limit: v.optional(v.number()), redo: v.optional(v.array(v.string())) },
  returns: v.object({ made: v.array(v.string()), failed: v.array(v.string()), remaining: v.number() }),
  handler: async (ctx, { limit, redo }): Promise<{ made: string[]; failed: string[]; remaining: number }> => {
    const todo: { id: Id<"products">; slug: string; name: string; description: string; group: string; category: string }[] =
      await ctx.runQuery(internal.catalogSeeds.productsWithoutPhotos, { redo });
    const batch = todo.slice(0, limit ?? 15);
    const made: string[] = [];
    const failed: string[] = [];
    for (const p of batch) {
      if (failed.some(isQuota)) break; // no point trying more today
      // A written scene when there is one; otherwise only the product's name
      // (descriptions get painted onto prints as garbled text).
      const scene = PHOTO_PROMPTS[p.name];
      const prompt = scene
        ? `${SCENE_STYLE} ${scene}.`
        : `${GENERIC_STYLE} Subject: ${p.name.toLowerCase()}, as made by a print and branding shop. Any printed surface shows only bold colourful abstract shapes and blank space.`;
      try {
        const bytes = await runPhotoModel(prompt);
        const storageId = await ctx.storage.store(new Blob([bytes], { type: sniffType(bytes) }));
        await ctx.runMutation(internal.catalogSeeds.attachImage, { storageId, productId: p.id, categoryId: null });
        made.push(p.slug);
      } catch (e) {
        failed.push(`${p.slug}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    return { made, failed, remaining: todo.length - made.length };
  },
});

const isQuota = (msg: string) => msg.includes("allowance is used up");

/** Runs generateMissingPhotos in batches until every product has a photo. When the
    daily free allowance runs out it schedules itself for just after the reset
    (4am Dubai = 00:00 UTC) and carries on the next day. Start it with:
      npx convex run --prod catalogSeeds:photosUntilDone */
export const photosUntilDone = internalAction({
  args: { day: v.optional(v.number()) },
  returns: v.string(),
  handler: async (ctx, { day = 1 }): Promise<string> => {
    let made = 0;
    for (let i = 0; i < 3; i++) { // stays well inside the 10-minute action limit
      const r: { made: string[]; failed: string[]; remaining: number } =
        await ctx.runAction(internal.catalogSeeds.generateMissingPhotos, { limit: 10 });
      made += r.made.length;
      if (r.remaining === 0) return `Done: ${made} photos made, none left.`;
      if (r.failed.some(isQuota) || (r.made.length === 0 && r.failed.length > 0)) {
        if (day >= 7) return `Stopped after 7 days with ${r.remaining} left.`;
        const reset = new Date();
        reset.setUTCHours(24, 10, 0, 0); // 00:10 UTC tomorrow
        await ctx.scheduler.runAt(reset, internal.catalogSeeds.photosUntilDone, { day: day + 1 });
        return `${made} made today, ${r.remaining} left. Continues ${reset.toISOString()}.`;
      }
    }
    // more to do and allowance left: carry on in a fresh run
    await ctx.scheduler.runAfter(0, internal.catalogSeeds.photosUntilDone, { day });
    return `${made} made, continuing.`;
  },
});

/** Stops the photosUntilDone chain (pending and running runs). */
export const stopPhotoJob = internalMutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const jobs = await ctx.db.system.query("_scheduled_functions").order("desc").take(200);
    let n = 0;
    for (const j of jobs) {
      if (j.name.includes("photosUntilDone") && (j.state.kind === "pending" || j.state.kind === "inProgress")) {
        await ctx.scheduler.cancel(j._id);
        n++;
      }
    }
    return n;
  },
});

/** Removes the photos of the given products (by name) so photosUntilDone
    makes new ones, e.g. after their scenes in photoPrompts.ts change. */
export const clearPhotos = internalMutation({
  args: { names: v.array(v.string()) },
  returns: v.number(),
  handler: async (ctx, { names }) => {
    let n = 0;
    for (const name of names) {
      const p = await ctx.db.query("products").withIndex("by_slug", (q) => q.eq("slug", slugify(name))).unique();
      if (!p?.imageIds.length) continue;
      await Promise.all(p.imageIds.map((id) => ctx.storage.delete(id)));
      await ctx.db.patch(p._id, { imageIds: [] });
      n++;
    }
    return n;
  },
});

/* ---------- section cover photos ---------- */

export const categoriesWithoutCover = internalQuery({
  args: { redo: v.optional(v.array(v.string())) },
  returns: v.array(v.object({ id: v.id("categories"), slug: v.string() })),
  handler: async (ctx, { redo = [] }) => {
    const cats = await ctx.db.query("categories").take(50);
    return cats.filter((c) => !c.imageId || redo.includes(c.slug)).map((c) => ({ id: c._id, slug: c.slug }));
  },
});

/** Cover photo for every category that has none (or is listed in `redo`)
    and has a scene in CATEGORY_PROMPTS:
      npx convex run --prod catalogSeeds:generateCategoryCovers '{}' */
export const generateCategoryCovers = internalAction({
  args: { redo: v.optional(v.array(v.string())) },
  returns: v.object({ made: v.array(v.string()), skipped: v.array(v.string()), failed: v.array(v.string()) }),
  handler: async (ctx, { redo }): Promise<{ made: string[]; skipped: string[]; failed: string[] }> => {
    const todo: { id: Id<"categories">; slug: string }[] = await ctx.runQuery(internal.catalogSeeds.categoriesWithoutCover, { redo });
    const made: string[] = [];
    const skipped: string[] = [];
    const failed: string[] = [];
    for (const c of todo) {
      const scene = CATEGORY_PROMPTS[c.slug];
      if (!scene) { skipped.push(c.slug); continue; }
      try {
        const bytes = await runPhotoModel(`${SCENE_STYLE} ${scene}.`);
        const storageId = await ctx.storage.store(new Blob([bytes], { type: sniffType(bytes) }));
        await ctx.runMutation(internal.catalogSeeds.attachImage, { storageId, productId: null, categoryId: c.id });
        made.push(c.slug);
      } catch (e) {
        failed.push(`${c.slug}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    return { made, skipped, failed };
  },
});

/* ---------- extra products (lib/seeds/extraProducts.ts) ---------- */

/** Adds the extra products to their categories, creating a group when it
    doesn't exist yet. Products that already exist are left alone. Then run
    photosUntilDone (or generateMissingPhotos) for their photos. */
export const addExtraProducts = internalMutation({
  args: {},
  returns: v.object({ added: v.array(v.string()), skipped: v.array(v.string()), groupsCreated: v.array(v.string()) }),
  handler: async (ctx) => {
    const added: string[] = [];
    const skipped: string[] = [];
    const groupsCreated: string[] = [];
    for (const item of EXTRA_PRODUCTS) {
      const cat = await categoryBySlug(ctx, item.category);
      const slug = slugify(item.name);
      const existing = await ctx.db.query("products").withIndex("by_slug", (q) => q.eq("slug", slug)).unique();
      if (!cat || existing) { skipped.push(slug); continue; }

      const groups = await ctx.db.query("groups").withIndex("by_categoryId_and_sortOrder", (q) => q.eq("categoryId", cat._id)).take(100);
      let group = groups.find((g) => g.name === item.group);
      if (!group) {
        const id = await ctx.db.insert("groups", { categoryId: cat._id, name: item.group, sortOrder: groups.reduce((m, g) => Math.max(m, g.sortOrder), -1) + 1 });
        group = (await ctx.db.get(id))!;
        groupsCreated.push(`${item.category}/${item.group}`);
      }
      const links = await ctx.db.query("productGroups").withIndex("by_groupId_and_sortOrder", (q) => q.eq("groupId", group._id)).take(500);
      const [lastProduct] = await ctx.db.query("products").order("desc").take(1);
      const productId = await ctx.db.insert("products", {
        slug,
        name: item.name,
        description: item.desc,
        badge: null,
        mockupShape: item.shape,
        imageIds: [],
        isFeatured: false,
        isActive: true,
        sortOrder: (lastProduct?.sortOrder ?? -1) + 1,
      });
      await ctx.db.insert("productGroups", { productId, groupId: group._id, isPrimary: true, sortOrder: links.reduce((m, l) => Math.max(m, l.sortOrder), -1) + 1 });
      added.push(slug);
    }
    return { added, skipped, groupsCreated };
  },
});

/** Uses a product's photo as a category's cover (menu and home card). The
    photo is copied, so the two can later change independently:
      npx convex run --prod catalogSeeds:useProductPhotoAsCover '{"productSlug":"...","categorySlug":"..."}' */
export const productPhotoUrl = internalQuery({
  args: { productSlug: v.string(), categorySlug: v.string() },
  returns: v.union(v.null(), v.object({ url: v.string(), categoryId: v.id("categories") })),
  handler: async (ctx, { productSlug, categorySlug }) => {
    const p = await ctx.db.query("products").withIndex("by_slug", (q) => q.eq("slug", productSlug)).unique();
    const cat = await ctx.db.query("categories").withIndex("by_slug", (q) => q.eq("slug", categorySlug)).unique();
    const url = p?.imageIds[0] ? await ctx.storage.getUrl(p.imageIds[0]) : null;
    return url && cat ? { url, categoryId: cat._id } : null;
  },
});

export const useProductPhotoAsCover = internalAction({
  args: { productSlug: v.string(), categorySlug: v.string() },
  returns: v.boolean(),
  handler: async (ctx, args): Promise<boolean> => {
    const found: { url: string; categoryId: Id<"categories"> } | null = await ctx.runQuery(internal.catalogSeeds.productPhotoUrl, args);
    if (!found) return false;
    const blob = await (await fetch(found.url)).blob();
    const storageId = await ctx.storage.store(blob);
    await ctx.runMutation(internal.catalogSeeds.attachImage, { storageId, productId: null, categoryId: found.categoryId });
    return true;
  },
});

/** Renames a category (everything on the site reads the name from here):
      npx convex run --prod catalogSeeds:renameCategory '{"slug":"gifts","name":"..."}' */
export const renameCategory = internalMutation({
  args: { slug: v.string(), name: v.string() },
  returns: v.boolean(),
  handler: async (ctx, { slug, name }) => {
    const cat = await categoryBySlug(ctx, slug);
    if (!cat) return false;
    await ctx.db.patch(cat._id, { name });
    return true;
  },
});

/* ---------- categories that reuse existing products (lib/seeds/linkedCategories.ts) ---------- */

/** Creates the linked categories (if missing) and lists their products there
    too; each product keeps its own main category. Safe to re-run. */
export const setupLinkedCategories = internalMutation({
  args: {},
  returns: v.object({ created: v.array(v.string()), linked: v.number(), missing: v.array(v.string()) }),
  handler: async (ctx) => {
    const created: string[] = [];
    const missing: string[] = [];
    let linked = 0;
    for (const spec of LINKED_CATEGORIES) {
      let cat = await categoryBySlug(ctx, spec.slug);
      if (!cat) {
        const all = await ctx.db.query("categories").take(50);
        const id = await ctx.db.insert("categories", {
          slug: spec.slug, name: spec.name, shortName: spec.shortName, tagline: spec.tagline,
          color: spec.color, tint: spec.tint, heroShape: spec.heroShape,
          imageId: null, isActive: true, sortOrder: all.reduce((m, c) => Math.max(m, c.sortOrder), -1) + 1,
        });
        cat = (await ctx.db.get(id))!;
        created.push(spec.slug);
      }
      const groups = await ctx.db.query("groups").withIndex("by_categoryId_and_sortOrder", (q) => q.eq("categoryId", cat._id)).take(100);
      for (const [gi, gs] of spec.groups.entries()) {
        let group = groups.find((g) => g.name === gs.name);
        if (!group) group = (await ctx.db.get(await ctx.db.insert("groups", { categoryId: cat._id, name: gs.name, sortOrder: gi })))!;
        const links = await ctx.db.query("productGroups").withIndex("by_groupId_and_sortOrder", (q) => q.eq("groupId", group._id)).take(500);
        for (const [pi, slug] of gs.products.entries()) {
          const p = await ctx.db.query("products").withIndex("by_slug", (q) => q.eq("slug", slug)).unique();
          if (!p) { missing.push(slug); continue; }
          if (links.some((l) => l.productId === p._id)) continue;
          await ctx.db.insert("productGroups", { productId: p._id, groupId: group._id, isPrimary: false, sortOrder: pi });
          linked++;
        }
      }
    }
    return { created, linked, missing };
  },
});

/** Puts categories in CATEGORY_ORDER (others keep their order, after these). */
export const applyCategoryOrder = internalMutation({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const cats = await ctx.db.query("categories").take(50);
    const rank = (slug: string) => { const i = CATEGORY_ORDER.indexOf(slug); return i === -1 ? CATEGORY_ORDER.length : i; };
    const sorted = [...cats].sort((a, b) => rank(a.slug) - rank(b.slug) || a.sortOrder - b.sortOrder);
    for (const [i, c] of sorted.entries()) if (c.sortOrder !== i) await ctx.db.patch(c._id, { sortOrder: i });
    return sorted.map((c) => c.slug);
  },
});
