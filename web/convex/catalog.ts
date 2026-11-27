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

  // 1. Load the whole tree (category → groups → links) in parallel.
  const tree = await Promise.all(cats.map(async (cat) => {
    const groups = await ctx.db
      .query("groups")
      .withIndex("by_categoryId_and_sortOrder", (q) => q.eq("categoryId", cat._id))
      .take(MAX_GROUPS);
    const groupLinks = await Promise.all(groups.map((g) => ctx.db
      .query("productGroups")
      .withIndex("by_groupId_and_sortOrder", (q) => q.eq("groupId", g._id))
      .take(MAX_ITEMS_PER_GROUP)));
    return { cat, groups: groups.map((g, i) => ({ g, links: groupLinks[i] })) };
  }));

  // 2. Fetch every referenced product once.
  const ids = [...new Set(tree.flatMap((t) => t.groups.flatMap((x) => x.links.map((l) => l.productId))))];
  const docs = await Promise.all(ids.map((id) => ctx.db.get(id)));
  const products = new Map(ids.map((id, i) => [id, docs[i]]));

  // A product whose primary link sits in a live category shows its card there;
  // otherwise its card falls back to the first live group it appears in.
  const livePrimary = new Set<Id<"products">>();
  for (const t of tree) for (const x of t.groups) for (const l of x.links) if (l.isPrimary) livePrimary.add(l.productId);

  // 3. Walk the tree in menu order to build the navigation and the cards.
  const categories = [];
  const cardSources: { p: Doc<"products">; cat: Doc<"categories">; group: string }[] = [];
  const placed = new Set<Id<"products">>();
  // every category/group a product is listed in (a product can be in several)
  const memberships = new Map<Id<"products">, { c: string; g: string }[]>();
  for (const { cat, groups } of tree) {
    const navGroups = [];
    for (const { g, links } of groups) {
      const items = [];
      for (const link of links) {
        const p = products.get(link.productId);
        if (!p?.isActive) continue;
        items.push({ name: p.name, slug: p.slug, shape: p.mockupShape });
        const m = memberships.get(p._id) ?? [];
        if (!m.some((x) => x.c === cat.slug && x.g === g.name)) m.push({ c: cat.slug, g: g.name });
        memberships.set(p._id, m);
        if (!placed.has(p._id) && (link.isPrimary || !livePrimary.has(p._id))) {
          placed.add(p._id);
          cardSources.push({ p, cat, group: g.name });
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
        image: cat.imageId ? await ctx.storage.getUrl(cat.imageId) : null,
        count: navGroups.reduce((a, x) => a + x.items.length, 0),
        groups: navGroups,
      });
    }
  }

  const images = await Promise.all(cardSources.map(({ p }) => firstImage(ctx, p)));
  return {
    categories,
    products: cardSources.map(({ p, cat, group }, i) => ({ ...toCard(p, cat, group, images[i]), in: memberships.get(p._id) ?? [] })),
  };
}

/** Everything the menu, footer, home page and catalogue need, in one live subscription. */
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
    const candidates = (await Promise.all(
      sameGroup.filter((l) => l.productId !== p._id).slice(0, 12).map((l) => ctx.db.get(l.productId)),
    )).filter((r): r is Doc<"products"> => r?.isActive === true).slice(0, 4);
    const related = await Promise.all(candidates.map(async (r) => toCard(r, cat, group.name, await firstImage(ctx, r))));

    return {
      status: "ok" as const,
      product: {
        ...toCard(p, cat, group.name, images[0] ?? null),
        images,
        desc: p.description,
      },
      related,
    };
  },
});

/** Landing page for one category (e.g. /woven-labels): every live product
 *  with its description and photo, grouped in menu order. */
export const getCategoryPage = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const cat = await ctx.db.query("categories").withIndex("by_slug", (q) => q.eq("slug", slug)).unique();
    if (!cat?.isActive) return null;
    const groups = await ctx.db
      .query("groups")
      .withIndex("by_categoryId_and_sortOrder", (q) => q.eq("categoryId", cat._id))
      .take(MAX_GROUPS);
    const sections = await Promise.all(groups.map(async (g) => {
      const links = await ctx.db
        .query("productGroups")
        .withIndex("by_groupId_and_sortOrder", (q) => q.eq("groupId", g._id))
        .take(MAX_ITEMS_PER_GROUP);
      const products = await Promise.all(links.map((l) => ctx.db.get(l.productId)));
      const items = await Promise.all(products
        .filter((p): p is Doc<"products"> => p?.isActive === true)
        .map(async (p) => ({
          slug: p.slug,
          name: p.name,
          desc: p.description,
          badge: p.badge,
          shape: p.mockupShape,
          image: await firstImage(ctx, p),
        })));
      return { name: g.name, items };
    }));
    return {
      slug: cat.slug,
      name: cat.name,
      tagline: cat.tagline,
      color: cat.color,
      tint: cat.tint,
      hero: cat.heroShape,
      image: cat.imageId ? await ctx.storage.getUrl(cat.imageId) : null,
      sections: sections.filter((s) => s.items.length),
    };
  },
});
