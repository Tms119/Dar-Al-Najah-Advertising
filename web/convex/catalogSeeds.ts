import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery, type MutationCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { slugify } from "./seedData";
import { DEFAULT_MODEL, runModel, sniffType } from "./lib/imageModel";
import { SEEDS } from "./lib/seeds";
import type { SeedItem } from "./lib/seeds/types";

/* Category setup from starter content (convex/lib/seeds). After setup,
   everything is edited in the admin like any other category. CLI only:
     npx convex run catalogSeeds:setup '{"slug":"stickers"}'
     npx convex run catalogSeeds:generateImages '{"slug":"stickers"}'
     npx convex run catalogSeeds:generateImages '{"slug":"stickers","redo":["car-stickers"]}'
     npx convex run catalogSeeds:syncGroups '{"slug":"stickers"}'   (add new starter groups)
     npx convex run catalogSeeds:removeCategory '{"slug":"photo"}' */

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
  handler: async (ctx, { slug, limit, redo }) => {
    const todo = await ctx.runQuery(internal.catalogSeeds.missingImages, { slug, redo: redo ?? [] });
    if (!todo) throw new Error(`Run catalogSeeds:setup for "${slug}" first`);
    const jobs: { photo: string; productId: Id<"products"> | null; categoryId: Id<"categories"> | null }[] = [
      ...(todo.categoryNeedsImage ? [{ photo: todo.heroPhoto, productId: null, categoryId: todo.categoryId }] : []),
      ...todo.products.map((p) => ({ photo: p.photo, productId: p.id, categoryId: null })),
    ].slice(0, limit ?? 50);

    let made = 0;
    const failed: string[] = [];
    for (const job of jobs) {
      try {
        const bytes = await runModel(DEFAULT_MODEL, `${PHOTO_STYLE} ${job.photo}.`, [], 1024, 1024);
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
