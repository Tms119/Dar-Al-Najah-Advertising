import { query, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";

/* Public, read-only catalogue API. Only active categories/products are ever
   returned, and empty groups/categories are dropped, so the menu always
   mirrors exactly what is live. */

const MAX_CATEGORIES = 20;
const MAX_GROUPS = 30;
const MAX_ITEMS_PER_GROUP = 300;

export type CardProduct = ReturnType<typeof toCard>;

function toCard(
  p: Doc<"products">,
  cat: Doc<"categories">,
  groupName: string,
  image: string | null,
) {
  return {
    id: p.slug,
    name: p.name,
    shape: p.mockupShape,
    category: cat.slug,
    categoryName: cat.name,
    group: groupName,
    color: cat.color,
    tint: cat.tint,
    price: p.basePrice,
    unit: p.priceUnit,
    turnaround: p.turnaround,
    badge: p.badge,
    featured: p.isFeatured,
    image,
  };
}

async function firstImage(ctx: QueryCtx, p: Doc<"products">) {
  return p.imageIds.length ? await ctx.storage.getUrl(p.imageIds[0]) : null;
}

async function buildCatalog(ctx: QueryCtx) {
  const cats = await ctx.db
    .query("categories")
    .withIndex("by_isActive_and_sortOrder", (q) => q.eq("isActive", true))
    .take(MAX_CATEGORIES);

  const productCache = new Map<Id<"products">, Doc<"products"> | null>();
  const getProduct = async (id: Id<"products">) => {
    if (!productCache.has(id)) productCache.set(id, await ctx.db.get(id));
    return productCache.get(id) ?? null;
  };

  const categories = [];
  const cards = [];
  const placed = new Set<Id<"products">>();

  for (const cat of cats) {
    const groups = await ctx.db
      .query("groups")
      .withIndex("by_categoryId_and_sortOrder", (q) => q.eq("categoryId", cat._id))
      .take(MAX_GROUPS);

    const navGroups = [];
    for (const g of groups) {
      const links = await ctx.db
        .query("productGroups")
        .withIndex("by_groupId_and_sortOrder", (q) => q.eq("groupId", g._id))
        .take(MAX_ITEMS_PER_GROUP);

      const items = [];
      for (const link of links) {
        const p = await getProduct(link.productId);
        if (!p || !p.isActive) continue;
        items.push({ name: p.name, slug: p.slug, shape: p.mockupShape });
        // a product's card lives in its primary group (or first live group)
        if (!placed.has(p._id) && (link.isPrimary || !(await hasLivePrimary(ctx, p._id)))) {
          placed.add(p._id);
          cards.push(toCard(p, cat, g.name, await firstImage(ctx, p)));
        }
      }
      if (items.length) navGroups.push({ name: g.name, items });
    }

    if (navGroups.length) {
      categories.push({
        id: cat.slug,
        name: cat.name,
        short: cat.shortName,
        tagline: cat.tagline,
        color: cat.color,
        tint: cat.tint,
        hero: cat.heroShape,
        count: navGroups.reduce((a, g) => a + g.items.length, 0),
        groups: navGroups,
      });
    }
  }

  return { categories, products: cards };
}

/** true if the product's primary group belongs to an active category */
async function hasLivePrimary(ctx: QueryCtx, productId: Id<"products">) {
  const links = await ctx.db
    .query("productGroups")
    .withIndex("by_productId", (q) => q.eq("productId", productId))
    .take(20);
  const primary = links.find((l) => l.isPrimary);
  if (!primary) return false;
  const group = await ctx.db.get(primary.groupId);
  const cat = group ? await ctx.db.get(group.categoryId) : null;
  return Boolean(cat?.isActive);
}

/** Everything the menu, footer, home page and catalogue need — one live subscription. */
export const getCatalog = query({
  args: {},
  handler: async (ctx) => buildCatalog(ctx),
});

/** Product detail page. Returns:
 *  { status: "ok", product, related } | { status: "inactive", categorySlug } | null */
export const getProduct = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const p = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!p) return null;

    const links = await ctx.db
      .query("productGroups")
      .withIndex("by_productId", (q) => q.eq("productId", p._id))
      .take(20);
    const primary = links.find((l) => l.isPrimary) ?? links[0];
    const group = primary ? await ctx.db.get(primary.groupId) : null;
    const cat = group ? await ctx.db.get(group.categoryId) : null;

    if (!p.isActive || !group || !cat || !cat.isActive) {
      return { status: "inactive" as const, categorySlug: cat?.isActive ? cat.slug : null };
    }

    const images = (
      await Promise.all(p.imageIds.map((id) => ctx.storage.getUrl(id)))
    ).filter((u): u is string => u !== null);

    // related: other live products from the same group first, then category
    const sameGroup = await ctx.db
      .query("productGroups")
      .withIndex("by_groupId_and_sortOrder", (q) => q.eq("groupId", group._id))
      .take(MAX_ITEMS_PER_GROUP);
    const related = [];
    for (const l of sameGroup) {
      if (related.length >= 4) break;
      if (l.productId === p._id) continue;
      const r = await ctx.db.get(l.productId);
      if (r?.isActive) related.push(toCard(r, cat, group.name, await firstImage(ctx, r)));
    }

    return {
      status: "ok" as const,
      product: {
        ...toCard(p, cat, group.name, images[0] ?? null),
        images,
        desc: p.description,
        options: p.options,
        tiers: p.quantityTiers,
      },
      related,
    };
  },
});
