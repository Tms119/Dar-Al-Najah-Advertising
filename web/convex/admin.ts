import { ConvexError, v } from "convex/values";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { requireAdmin } from "./lib/admin";
import { requiredText, text } from "./lib/validate";

/* Admin dashboard API. Every function starts with requireAdmin(), which
   rejects anyone not signed in or not an admin. */

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const direction = v.union(v.literal("up"), v.literal("down"));

async function checkImage(ctx: MutationCtx, id: Id<"_storage">) {
  const meta = await ctx.db.system.get("_storage", id);
  if (!meta) throw new ConvexError("An uploaded image is missing. Please upload it again");
  if (!meta.contentType?.startsWith("image/")) throw new ConvexError("Only image files can be used as photos");
  if (meta.size > MAX_IMAGE_BYTES) throw new ConvexError("Images must be under 8 MB");
}

function checkSlug(slug: string) {
  if (!SLUG_RE.test(slug) || slug.length > 80)
    throw new ConvexError("Slug may only contain lowercase letters, numbers and single dashes");
  return slug;
}

const groupsOf = (ctx: QueryCtx, categoryId: Id<"categories">) =>
  ctx.db.query("groups").withIndex("by_categoryId_and_sortOrder", (q) => q.eq("categoryId", categoryId));
const linksOfGroup = (ctx: QueryCtx, groupId: Id<"groups">) =>
  ctx.db.query("productGroups").withIndex("by_groupId_and_sortOrder", (q) => q.eq("groupId", groupId));
const linksOfProduct = (ctx: QueryCtx, productId: Id<"products">) =>
  ctx.db.query("productGroups").withIndex("by_productId", (q) => q.eq("productId", productId)).take(20);

/** Moves one item up or down in a sorted list, renumbering first so equal
    sortOrders can never get stuck. */
async function swapNeighbour<T extends "categories" | "groups" | "productGroups">(
  ctx: MutationCtx,
  ordered: { _id: Id<T>; sortOrder: number }[],
  id: Id<T>,
  dir: "up" | "down",
) {
  const patch = (docId: Id<T>, sortOrder: number) =>
    ctx.db.patch(docId as Id<"categories">, { sortOrder }); // every table here has a numeric sortOrder
  await Promise.all(ordered.map((d, i) => (d.sortOrder !== i ? patch(d._id, i) : null)));
  const i = ordered.findIndex((d) => d._id === id);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= ordered.length) return;
  await Promise.all([patch(ordered[i]._id, j), patch(ordered[j]._id, i)]);
}

/* ---------------- overview ---------------- */

export const overview = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const [products, categories, unpaid] = await Promise.all([
      ctx.db.query("products").take(1000),
      ctx.db.query("categories").take(50),
      ctx.db.query("invoices").withIndex("by_status", (q) => q.eq("status", "issued")).take(1000),
    ]);
    return {
      products: products.length,
      activeProducts: products.filter((p) => p.isActive).length,
      featured: products.filter((p) => p.isFeatured && p.isActive).length,
      categories: categories.length,
      unpaidInvoices: unpaid.length,
    };
  },
});

/** Sidebar badges. Kept separate from overview so every admin page doesn't
    re-run a product scan whenever any product changes. */
export const badgeCounts = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const unpaid = await ctx.db.query("invoices").withIndex("by_status", (q) => q.eq("status", "issued")).take(100);
    return { unpaidInvoices: unpaid.length };
  },
});

/* ---------------- structure (categories + groups) ---------------- */

export const structure = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const cats = (await ctx.db.query("categories").take(50)).sort((a, b) => a.sortOrder - b.sortOrder);
    return await Promise.all(cats.map(async (c) => {
      const groups = await groupsOf(ctx, c._id).take(50);
      const [imageUrl, withCounts] = await Promise.all([
        c.imageId ? ctx.storage.getUrl(c.imageId) : null,
        Promise.all(groups.map(async (g) => ({
          _id: g._id,
          name: g.name,
          sortOrder: g.sortOrder,
          productCount: (await linksOfGroup(ctx, g._id).take(500)).length,
        }))),
      ]);
      return { ...c, imageUrl, groups: withCounts };
    }));
  },
});

export const saveCategory = mutation({
  args: {
    id: v.union(v.id("categories"), v.null()),
    slug: v.string(),
    name: v.string(),
    shortName: v.string(),
    tagline: v.string(),
    color: v.string(),
    tint: v.string(),
    heroShape: v.string(),
    imageId: v.union(v.id("_storage"), v.null()),
    isActive: v.boolean(),
  },
  returns: v.id("categories"),
  handler: async (ctx, a) => {
    await requireAdmin(ctx);
    const slug = checkSlug(a.slug.trim());
    if (!HEX_RE.test(a.color) || !HEX_RE.test(a.tint)) throw new ConvexError("Colours must be hex like #2B3BFF");
    const clash = await ctx.db.query("categories").withIndex("by_slug", (q) => q.eq("slug", slug)).unique();
    if (clash && clash._id !== a.id) throw new ConvexError(`Another category already uses the slug "${slug}"`);
    if (a.imageId) await checkImage(ctx, a.imageId);
    const fields = {
      slug,
      name: requiredText(a.name, 60, "Name"),
      shortName: requiredText(a.shortName, 20, "Short name"),
      tagline: text(a.tagline, 160, "Tagline"),
      color: a.color,
      tint: a.tint,
      heroShape: requiredText(a.heroShape, 30, "Illustration"),
      imageId: a.imageId,
      isActive: a.isActive,
    };
    if (a.id) {
      const before = await ctx.db.get(a.id);
      if (!before) throw new ConvexError("Category not found");
      if (before.imageId && before.imageId !== a.imageId) await ctx.storage.delete(before.imageId);
      await ctx.db.patch(a.id, fields);
      return a.id;
    }
    const all = await ctx.db.query("categories").take(50);
    const sortOrder = all.reduce((m, c) => Math.max(m, c.sortOrder), -1) + 1;
    return await ctx.db.insert("categories", { ...fields, sortOrder });
  },
});

export const deleteCategory = mutation({
  args: { id: v.id("categories") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    if ((await groupsOf(ctx, id).take(1)).length) throw new ConvexError("Delete or move this category's groups first");
    const cat = await ctx.db.get(id);
    if (cat?.imageId) await ctx.storage.delete(cat.imageId);
    await ctx.db.delete(id);
    return null;
  },
});

export const moveCategory = mutation({
  args: { id: v.id("categories"), direction },
  returns: v.null(),
  handler: async (ctx, { id, direction: dir }) => {
    await requireAdmin(ctx);
    const all = (await ctx.db.query("categories").take(50)).sort((a, b) => a.sortOrder - b.sortOrder);
    await swapNeighbour(ctx, all, id, dir);
    return null;
  },
});

export const saveGroup = mutation({
  args: { id: v.union(v.id("groups"), v.null()), categoryId: v.id("categories"), name: v.string() },
  returns: v.id("groups"),
  handler: async (ctx, a) => {
    await requireAdmin(ctx);
    const name = requiredText(a.name, 60, "Group name");
    if (!(await ctx.db.get(a.categoryId))) throw new ConvexError("Category not found");
    if (a.id) {
      await ctx.db.patch(a.id, { name, categoryId: a.categoryId });
      return a.id;
    }
    const [last] = await groupsOf(ctx, a.categoryId).order("desc").take(1);
    return await ctx.db.insert("groups", { categoryId: a.categoryId, name, sortOrder: (last?.sortOrder ?? -1) + 1 });
  },
});

export const deleteGroup = mutation({
  args: { id: v.id("groups") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    if ((await linksOfGroup(ctx, id).take(1)).length) throw new ConvexError("Move or remove the products in this group first");
    await ctx.db.delete(id);
    return null;
  },
});

export const moveGroup = mutation({
  args: { id: v.id("groups"), direction },
  returns: v.null(),
  handler: async (ctx, { id, direction: dir }) => {
    await requireAdmin(ctx);
    const g = await ctx.db.get(id);
    if (!g) throw new ConvexError("Group not found");
    await swapNeighbour(ctx, await groupsOf(ctx, g.categoryId).take(50), id, dir);
    return null;
  },
});

/* ---------------- products ---------------- */

export const listProducts = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const products = await ctx.db.query("products").take(1000);
    // groups and categories are shared by many products: fetch each once
    const groupCache = new Map<Id<"groups">, Promise<Doc<"groups"> | null>>();
    const catCache = new Map<Id<"categories">, Promise<Doc<"categories"> | null>>();
    const cached = <K, T>(m: Map<K, Promise<T>>, k: K, load: () => Promise<T>) => {
      if (!m.has(k)) m.set(k, load());
      return m.get(k)!;
    };

    return await Promise.all(products.map(async (p) => {
      const [links, image] = await Promise.all([
        linksOfProduct(ctx, p._id),
        p.imageIds.length ? ctx.storage.getUrl(p.imageIds[0]) : null,
      ]);
      const primary = links.find((l) => l.isPrimary) ?? links[0];
      const group = primary ? await cached(groupCache, primary.groupId, () => ctx.db.get(primary.groupId)) : null;
      const cat = group ? await cached(catCache, group.categoryId, () => ctx.db.get(group.categoryId)) : null;
      return {
        _id: p._id,
        slug: p.slug,
        name: p.name,
        isActive: p.isActive,
        isFeatured: p.isFeatured,
        badge: p.badge,
        mockupShape: p.mockupShape,
        image,
        categorySlug: cat?.slug ?? null,
        categoryName: cat?.name ?? "Unassigned",
        color: cat?.color ?? "#888888",
        groupName: group?.name ?? "No group",
        menuCount: links.length,
        updated: p._creationTime,
      };
    }));
  },
});

export const getProduct = query({
  args: { id: v.id("products") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const p = await ctx.db.get(id);
    if (!p) return null;
    const [links, images] = await Promise.all([
      linksOfProduct(ctx, id),
      Promise.all(p.imageIds.map(async (imgId) => ({ id: imgId, url: await ctx.storage.getUrl(imgId) }))),
    ]);
    return {
      ...p,
      images,
      groupIds: links.map((l) => l.groupId),
      primaryGroupId: (links.find((l) => l.isPrimary) ?? links[0])?.groupId ?? null,
    };
  },
});

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveProduct = mutation({
  args: {
    id: v.union(v.id("products"), v.null()),
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    badge: v.union(v.string(), v.null()),
    mockupShape: v.string(),
    imageIds: v.array(v.id("_storage")),
    isFeatured: v.boolean(),
    isActive: v.boolean(),
    groupIds: v.array(v.id("groups")),
    primaryGroupId: v.id("groups"),
  },
  returns: v.id("products"),
  handler: async (ctx, a) => {
    await requireAdmin(ctx);

    const slug = checkSlug(a.slug.trim());
    const clash = await ctx.db.query("products").withIndex("by_slug", (q) => q.eq("slug", slug)).unique();
    if (clash && clash._id !== a.id) throw new ConvexError(`Another product already uses the slug "${slug}"`);

    if (a.imageIds.length > 12) throw new ConvexError("Up to 12 images per product");
    await Promise.all(a.imageIds.map((imgId) => checkImage(ctx, imgId)));

    const groupIds = [...new Set(a.groupIds)];
    if (!groupIds.length) throw new ConvexError("Choose at least one menu group");
    if (!groupIds.includes(a.primaryGroupId)) throw new ConvexError("The primary group must be one of the selected groups");
    const groups = await Promise.all(groupIds.map((gid) => ctx.db.get(gid)));
    if (groups.some((g) => g === null)) throw new ConvexError("A selected group no longer exists");

    const fields = {
      slug,
      name: requiredText(a.name, 80, "Name"),
      description: requiredText(a.description, 2000, "Description"),
      badge: a.badge?.trim() ? requiredText(a.badge, 20, "Badge") : null,
      mockupShape: requiredText(a.mockupShape, 30, "Illustration"),
      imageIds: a.imageIds,
      isFeatured: a.isFeatured,
      isActive: a.isActive,
    };

    let id: Id<"products">;
    if (a.id) {
      const before = await ctx.db.get(a.id);
      if (!before) throw new ConvexError("Product not found");
      // delete storage files that were removed from the product
      await Promise.all(before.imageIds.filter((old) => !fields.imageIds.includes(old)).map((old) => ctx.storage.delete(old)));
      await ctx.db.patch(a.id, fields);
      id = a.id;
    } else {
      const [last] = await ctx.db.query("products").order("desc").take(1);
      id = await ctx.db.insert("products", { ...fields, sortOrder: (last?.sortOrder ?? -1) + 1 });
    }

    // sync menu placements
    const existing = await linksOfProduct(ctx, id);
    for (const l of existing) {
      const isPrimary = l.groupId === a.primaryGroupId;
      if (!groupIds.includes(l.groupId)) await ctx.db.delete(l._id);
      else if (l.isPrimary !== isPrimary) await ctx.db.patch(l._id, { isPrimary });
    }
    for (const gid of groupIds) {
      if (existing.some((l) => l.groupId === gid)) continue;
      const [tail] = await linksOfGroup(ctx, gid).order("desc").take(1);
      await ctx.db.insert("productGroups", {
        productId: id,
        groupId: gid,
        isPrimary: gid === a.primaryGroupId,
        sortOrder: (tail?.sortOrder ?? -1) + 1,
      });
    }
    return id;
  },
});

export const setProductActive = mutation({
  args: { id: v.id("products"), isActive: v.boolean() },
  returns: v.null(),
  handler: async (ctx, { id, isActive }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, { isActive });
    return null;
  },
});

export const setProductFeatured = mutation({
  args: { id: v.id("products"), isFeatured: v.boolean() },
  returns: v.null(),
  handler: async (ctx, { id, isFeatured }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, { isFeatured });
    return null;
  },
});

export const deleteProduct = mutation({
  args: { id: v.id("products") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const p = await ctx.db.get(id);
    if (!p) return null;
    const links = await linksOfProduct(ctx, id);
    await Promise.all([
      ...links.map((l) => ctx.db.delete(l._id)),
      ...p.imageIds.map((img) => ctx.storage.delete(img)),
    ]);
    await ctx.db.delete(id);
    return null;
  },
});

/** Group contents in menu order, for the reorder screen. */
export const groupProducts = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, { groupId }) => {
    await requireAdmin(ctx);
    const links = await linksOfGroup(ctx, groupId).take(500);
    const products = await Promise.all(links.map((l) => ctx.db.get(l.productId)));
    return links.flatMap((l, i) => {
      const p = products[i];
      return p ? [{ linkId: l._id, productId: p._id, name: p.name, isActive: p.isActive, mockupShape: p.mockupShape }] : [];
    });
  },
});

export const moveProductInGroup = mutation({
  args: { linkId: v.id("productGroups"), direction },
  returns: v.null(),
  handler: async (ctx, { linkId, direction: dir }) => {
    await requireAdmin(ctx);
    const link = await ctx.db.get(linkId);
    if (!link) throw new ConvexError("Not found");
    await swapNeighbour(ctx, await linksOfGroup(ctx, link.groupId).take(500), linkId, dir);
    return null;
  },
});
