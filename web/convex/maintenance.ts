import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { cleanCopy } from "./lib/copy";

/** One-time copy clean-up (no dashes / hyphenated marketing words) for data
 *  already in the database. Idempotent: safe to run again.
 *  npx convex run maintenance:cleanCopy --prod */
export const cleanCopy_ = internalMutation({
  args: {},
  returns: v.object({ products: v.number(), categories: v.number() }),
  handler: async (ctx) => {
    let products = 0;
    let categories = 0;
    for (const p of await ctx.db.query("products").take(1000)) {
      const next = {
        description: cleanCopy(p.description),
        priceUnit: cleanCopy(p.priceUnit),
        turnaround: cleanCopy(p.turnaround),
        options: p.options.map((o) => ({
          name: cleanCopy(o.name),
          values: o.values.map((x) => ({ ...x, label: cleanCopy(x.label) })),
        })),
      };
      if (JSON.stringify(next) !== JSON.stringify({ description: p.description, priceUnit: p.priceUnit, turnaround: p.turnaround, options: p.options })) {
        await ctx.db.patch(p._id, next);
        products++;
      }
    }
    for (const c of await ctx.db.query("categories").take(100)) {
      const tagline = cleanCopy(c.tagline);
      if (tagline !== c.tagline) {
        await ctx.db.patch(c._id, { tagline });
        categories++;
      }
    }
    return { products, categories };
  },
});
export { cleanCopy_ as cleanCopy };

/** Read-only health check of the catalogue data.
 *  npx convex run maintenance:integrity --prod */
export const integrity = internalQuery({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").take(2000);
    const categories = await ctx.db.query("categories").take(200);
    const groups = await ctx.db.query("groups").take(1000);
    const links = await ctx.db.query("productGroups").take(5000);
    const pIds = new Set(products.map((p) => p._id as string));
    const gIds = new Set(groups.map((g) => g._id as string));
    const cIds = new Set(categories.map((c) => c._id as string));
    const slugCount = new Map<string, number>();
    products.forEach((p) => slugCount.set(p.slug, (slugCount.get(p.slug) ?? 0) + 1));
    const linked = new Set(links.map((l) => l.productId as string));
    const primaryCount = new Map<string, number>();
    links.forEach((l) => l.isPrimary && primaryCount.set(l.productId, (primaryCount.get(l.productId) ?? 0) + 1));
    const dash = /[—–]/;
    return {
      counts: { products: products.length, active: products.filter((p) => p.isActive).length, categories: categories.length, groups: groups.length, links: links.length },
      duplicateSlugs: [...slugCount].filter(([, n]) => n > 1).map(([s]) => s),
      productsWithNoMenuGroup: products.filter((p) => !linked.has(p._id)).map((p) => p.slug),
      productsWithoutOnePrimary: products.filter((p) => linked.has(p._id) && primaryCount.get(p._id) !== 1).map((p) => p.slug),
      linksToMissingProduct: links.filter((l) => !pIds.has(l.productId)).length,
      linksToMissingGroup: links.filter((l) => !gIds.has(l.groupId)).length,
      groupsWithMissingCategory: groups.filter((g) => !cIds.has(g.categoryId)).length,
      productsWithNoTiers: products.filter((p) => p.quantityTiers.length === 0).map((p) => p.slug),
      copyWithDashes: [
        ...products.filter((p) => dash.test(p.description + p.turnaround + p.priceUnit + JSON.stringify(p.options))).map((p) => p.slug),
        ...categories.filter((c) => dash.test(c.tagline)).map((c) => `category:${c.slug}`),
      ],
    };
  },
});
