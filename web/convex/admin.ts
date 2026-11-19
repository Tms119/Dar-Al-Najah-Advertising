import { ConvexError, v } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { optionValidator, quoteStatus, tierValidator } from "./schema";
import { requireAdmin } from "./lib/admin";

/* Admin dashboard API. Every function starts with requireAdmin(), which
   rejects anyone not signed in or not on the ADMIN_USERNAMES allowlist. */

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HEX_RE = /^#[0-9a-fA-F]{6}$/;

function text(s: string, max: number, field: string, required = true) {
  const t = s.trim();
  if (required && !t) throw new ConvexError(`${field} is required`);
  if (t.length > max) throw new ConvexError(`${field} must be at most ${max} characters`);
  return t;
}

function checkSlug(slug: string) {
  if (!SLUG_RE.test(slug) || slug.length > 80)
    throw new ConvexError("Slug may only contain lowercase letters, numbers and single dashes");
  return slug;
}

/* ---------------- overview ---------------- */

export const overview = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const products = await ctx.db.query("products").take(1000);
    const newQuotes = await ctx.db
      .query("quoteRequests")
      .withIndex("by_status", (q) => q.eq("status", "new"))
      .take(1000);
    const categories = await ctx.db.query("categories").take(50);
    return {
      products: products.length,
      activeProducts: products.filter((p) => p.isActive).length,
      featured: products.filter((p) => p.isFeatured && p.isActive).length,
      newQuotes: newQuotes.length,
      categories: categories.length,
    };
  },
});

/* ---------------- structure (categories + groups) ---------------- */

export const structure = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const cats = await ctx.db.query("categories").take(50);
    cats.sort((a, b) => a.sortOrder - b.sortOrder);
    const out = [];
    for (const c of cats) {
      const groups = await ctx.db
        .query("groups")
        .withIndex("by_categoryId_and_sortOrder", (q) => q.eq("categoryId", c._id))
        .take(50);
      const withCounts = [];
      for (const g of groups) {
        const links = await ctx.db
          .query("productGroups")
          .withIndex("by_groupId_and_sortOrder", (q) => q.eq("groupId", g._id))
          .take(500);
        withCounts.push({ _id: g._id, name: g.name, sortOrder: g.sortOrder, productCount: links.length });
      }
      out.push({ ...c, groups: withCounts });
    }
    return out;
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
    isActive: v.boolean(),
  },
  returns: v.id("categories"),
  handler: async (ctx, a) => {
    await requireAdmin(ctx);
    const slug = checkSlug(a.slug.trim());
    if (!HEX_RE.test(a.color) || !HEX_RE.test(a.tint)) throw new ConvexError("Colours must be hex like #2B3BFF");
    const clash = await ctx.db.query("categories").withIndex("by_slug", (q) => q.eq("slug", slug)).unique();
    if (clash && clash._id !== a.id) throw new ConvexError(`Another category already uses the slug "${slug}"`);
    const fields = {
      slug,
      name: text(a.name, 60, "Name"),
      shortName: text(a.shortName, 20, "Short name"),
      tagline: text(a.tagline, 160, "Tagline", false),
      color: a.color,
      tint: a.tint,
      heroShape: text(a.heroShape, 30, "Illustration"),
      isActive: a.isActive,
    };
    if (a.id) {
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
    const groups = await ctx.db
      .query("groups")
      .withIndex("by_categoryId_and_sortOrder", (q) => q.eq("categoryId", id))
      .take(1);
    if (groups.length) throw new ConvexError("Delete or move this category's groups first");
    await ctx.db.delete(id);
    return null;
  },
});

export const moveCategory = mutation({
  args: { id: v.id("categories"), direction: v.union(v.literal("up"), v.literal("down")) },
  returns: v.null(),
  handler: async (ctx, { id, direction }) => {
    await requireAdmin(ctx);
    const all = (await ctx.db.query("categories").take(50)).sort((a, b) => a.sortOrder - b.sortOrder);
    await swapNeighbour(ctx, all, id, direction, "categories");
    return null;
  },
});

export const saveGroup = mutation({
  args: { id: v.union(v.id("groups"), v.null()), categoryId: v.id("categories"), name: v.string() },
  returns: v.id("groups"),
  handler: async (ctx, a) => {
    await requireAdmin(ctx);
    const name = text(a.name, 60, "Group name");
    if (!(await ctx.db.get(a.categoryId))) throw new ConvexError("Category not found");
    if (a.id) {
      await ctx.db.patch(a.id, { name, categoryId: a.categoryId });
      return a.id;
    }
    const siblings = await ctx.db
      .query("groups")
      .withIndex("by_categoryId_and_sortOrder", (q) => q.eq("categoryId", a.categoryId))
      .order("desc")
      .take(1);
    return await ctx.db.insert("groups", { categoryId: a.categoryId, name, sortOrder: (siblings[0]?.sortOrder ?? -1) + 1 });
  },
});

export const deleteGroup = mutation({
  args: { id: v.id("groups") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const links = await ctx.db
      .query("productGroups")
      .withIndex("by_groupId_and_sortOrder", (q) => q.eq("groupId", id))
      .take(1);
    if (links.length) throw new ConvexError("Move or remove the products in this group first");
    await ctx.db.delete(id);
    return null;
  },
});

export const moveGroup = mutation({
  args: { id: v.id("groups"), direction: v.union(v.literal("up"), v.literal("down")) },
  returns: v.null(),
  handler: async (ctx, { id, direction }) => {
    await requireAdmin(ctx);
    const g = await ctx.db.get(id);
    if (!g) throw new ConvexError("Group not found");
    const siblings = await ctx.db
      .query("groups")
      .withIndex("by_categoryId_and_sortOrder", (q) => q.eq("categoryId", g.categoryId))
      .take(50);
    await swapNeighbour(ctx, siblings, id, direction, "groups");
    return null;
  },
});

async function swapNeighbour<T extends "categories" | "groups" | "productGroups">(
  ctx: MutationCtx,
  ordered: { _id: Id<T>; sortOrder: number }[],
  id: Id<T>,
  direction: "up" | "down",
  _table: T,
) {
  // normalise first so equal sortOrders can't get stuck
  for (const [i, d] of ordered.entries()) {
    if (d.sortOrder !== i) await ctx.db.patch(d._id, { sortOrder: i } as never);
  }
  const i = ordered.findIndex((d) => d._id === id);
  const j = direction === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= ordered.length) return;
  await ctx.db.patch(ordered[i]._id, { sortOrder: j } as never);
  await ctx.db.patch(ordered[j]._id, { sortOrder: i } as never);
}

/* ---------------- products ---------------- */

export const listProducts = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const products = await ctx.db.query("products").take(1000);
    const groupCache = new Map<Id<"groups">, Doc<"groups"> | null>();
    const catCache = new Map<Id<"categories">, Doc<"categories"> | null>();
    const out = [];
    for (const p of products) {
      const links = await ctx.db
        .query("productGroups")
        .withIndex("by_productId", (q) => q.eq("productId", p._id))
        .take(20);
      const primary = links.find((l) => l.isPrimary) ?? links[0];
      let group: Doc<"groups"> | null = null;
      let cat: Doc<"categories"> | null = null;
      if (primary) {
        if (!groupCache.has(primary.groupId)) groupCache.set(primary.groupId, await ctx.db.get(primary.groupId));
        group = groupCache.get(primary.groupId) ?? null;
        if (group) {
          if (!catCache.has(group.categoryId)) catCache.set(group.categoryId, await ctx.db.get(group.categoryId));
          cat = catCache.get(group.categoryId) ?? null;
        }
      }
      out.push({
        _id: p._id,
        slug: p.slug,
        name: p.name,
        basePrice: p.basePrice,
        isActive: p.isActive,
        isFeatured: p.isFeatured,
        badge: p.badge,
        mockupShape: p.mockupShape,
        image: p.imageIds.length ? await ctx.storage.getUrl(p.imageIds[0]) : null,
        categorySlug: cat?.slug ?? null,
        categoryName: cat?.name ?? "Unassigned",
        color: cat?.color ?? "#888888",
        groupName: group?.name ?? "—",
        menuCount: links.length,
        updated: p._creationTime,
      });
    }
    return out;
  },
});

export const getProduct = query({
  args: { id: v.id("products") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const p = await ctx.db.get(id);
    if (!p) return null;
    const links = await ctx.db
      .query("productGroups")
      .withIndex("by_productId", (q) => q.eq("productId", id))
      .take(20);
    const images = [];
    for (const imgId of p.imageIds) images.push({ id: imgId, url: await ctx.storage.getUrl(imgId) });
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
    basePrice: v.number(),
    priceUnit: v.string(),
    turnaround: v.string(),
    badge: v.union(v.string(), v.null()),
    mockupShape: v.string(),
    imageIds: v.array(v.id("_storage")),
    options: v.array(optionValidator),
    quantityTiers: v.array(tierValidator),
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

    if (!Number.isFinite(a.basePrice) || a.basePrice < 0 || a.basePrice > 1_000_000)
      throw new ConvexError("Price must be a positive number");
    if (a.imageIds.length > 12) throw new ConvexError("Up to 12 images per product");
    for (const imgId of a.imageIds) {
      const meta = await ctx.db.system.get("_storage", imgId);
      if (!meta) throw new ConvexError("An uploaded image is missing — please upload it again");
      if (!meta.contentType?.startsWith("image/")) throw new ConvexError("Only image files can be used as product photos");
      if (meta.size > 8 * 1024 * 1024) throw new ConvexError("Images must be under 8 MB");
    }
    if (a.options.length > 8) throw new ConvexError("Up to 8 option groups");
    for (const o of a.options) {
      text(o.name, 40, "Option name");
      if (!o.values.length || o.values.length > 20) throw new ConvexError(`"${o.name}" needs 1–20 values`);
      for (const val of o.values) {
        text(val.label, 60, "Option value");
        if (!Number.isFinite(val.priceModifier) || val.priceModifier < -90 || val.priceModifier > 1000)
          throw new ConvexError("Price modifier must be between -90% and 1000%");
      }
    }
    if (!a.quantityTiers.length || a.quantityTiers.length > 10) throw new ConvexError("Add 1–10 quantity tiers");
    for (const t of a.quantityTiers) {
      if (!Number.isInteger(t.quantity) || t.quantity < 1) throw new ConvexError("Quantities must be whole numbers ≥ 1");
      if (!Number.isFinite(t.price) || t.price < 0) throw new ConvexError("Tier prices must be positive");
    }

    const groupIds = [...new Set(a.groupIds)];
    if (!groupIds.length) throw new ConvexError("Choose at least one menu group");
    if (!groupIds.includes(a.primaryGroupId)) throw new ConvexError("The primary group must be one of the selected groups");
    for (const gid of groupIds) if (!(await ctx.db.get(gid))) throw new ConvexError("A selected group no longer exists");

    const fields = {
      slug,
      name: text(a.name, 80, "Name"),
      description: text(a.description, 2000, "Description"),
      basePrice: a.basePrice,
      priceUnit: text(a.priceUnit, 40, "Price unit"),
      turnaround: text(a.turnaround, 40, "Turnaround"),
      badge: a.badge && a.badge.trim() ? text(a.badge, 20, "Badge") : null,
      mockupShape: text(a.mockupShape, 30, "Illustration"),
      imageIds: a.imageIds,
      options: a.options.map((o) => ({
        name: o.name.trim(),
        values: o.values.map((x) => ({ label: x.label.trim(), priceModifier: x.priceModifier })),
      })),
      quantityTiers: [...a.quantityTiers].sort((x, y) => x.quantity - y.quantity),
      isFeatured: a.isFeatured,
      isActive: a.isActive,
    };

    let id: Id<"products">;
    if (a.id) {
      const before = await ctx.db.get(a.id);
      if (!before) throw new ConvexError("Product not found");
      // delete storage files that were removed from the product
      for (const old of before.imageIds) if (!fields.imageIds.includes(old)) await ctx.storage.delete(old);
      await ctx.db.patch(a.id, fields);
      id = a.id;
    } else {
      const last = await ctx.db.query("products").order("desc").take(1);
      id = await ctx.db.insert("products", { ...fields, sortOrder: (last[0]?.sortOrder ?? -1) + 1 });
    }

    // sync menu placements
    const existing = await ctx.db
      .query("productGroups")
      .withIndex("by_productId", (q) => q.eq("productId", id))
      .take(20);
    for (const l of existing) {
      if (!groupIds.includes(l.groupId)) await ctx.db.delete(l._id);
      else if (l.isPrimary !== (l.groupId === a.primaryGroupId)) await ctx.db.patch(l._id, { isPrimary: l.groupId === a.primaryGroupId });
    }
    for (const gid of groupIds) {
      if (existing.some((l) => l.groupId === gid)) continue;
      const tail = await ctx.db
        .query("productGroups")
        .withIndex("by_groupId_and_sortOrder", (q) => q.eq("groupId", gid))
        .order("desc")
        .take(1);
      await ctx.db.insert("productGroups", {
        productId: id,
        groupId: gid,
        isPrimary: gid === a.primaryGroupId,
        sortOrder: (tail[0]?.sortOrder ?? -1) + 1,
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
    const links = await ctx.db
      .query("productGroups")
      .withIndex("by_productId", (q) => q.eq("productId", id))
      .take(20);
    for (const l of links) await ctx.db.delete(l._id);
    for (const img of p.imageIds) await ctx.storage.delete(img);
    await ctx.db.delete(id);
    return null;
  },
});

/** Group contents in menu order, for the reorder screen. */
export const groupProducts = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, { groupId }) => {
    await requireAdmin(ctx);
    const links = await ctx.db
      .query("productGroups")
      .withIndex("by_groupId_and_sortOrder", (q) => q.eq("groupId", groupId))
      .take(500);
    const out = [];
    for (const l of links) {
      const p = await ctx.db.get(l.productId);
      if (p) out.push({ linkId: l._id, productId: p._id, name: p.name, isActive: p.isActive, mockupShape: p.mockupShape });
    }
    return out;
  },
});

export const moveProductInGroup = mutation({
  args: { linkId: v.id("productGroups"), direction: v.union(v.literal("up"), v.literal("down")) },
  returns: v.null(),
  handler: async (ctx, { linkId, direction }) => {
    await requireAdmin(ctx);
    const link = await ctx.db.get(linkId);
    if (!link) throw new ConvexError("Not found");
    const siblings = await ctx.db
      .query("productGroups")
      .withIndex("by_groupId_and_sortOrder", (q) => q.eq("groupId", link.groupId))
      .take(500);
    await swapNeighbour(ctx, siblings, linkId, direction, "productGroups");
    return null;
  },
});

/* ---------------- quote inbox ---------------- */

export const listQuotes = query({
  args: { status: v.union(quoteStatus, v.null()) },
  handler: async (ctx, { status }) => {
    await requireAdmin(ctx);
    const rows = status
      ? await ctx.db.query("quoteRequests").withIndex("by_status", (q) => q.eq("status", status)).order("desc").take(300)
      : await ctx.db.query("quoteRequests").order("desc").take(300);
    return rows;
  },
});

export const setQuoteStatus = mutation({
  args: { id: v.id("quoteRequests"), status: quoteStatus },
  returns: v.null(),
  handler: async (ctx, { id, status }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, { status });
    return null;
  },
});

export const deleteQuote = mutation({
  args: { id: v.id("quoteRequests") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(id);
    return null;
  },
});
