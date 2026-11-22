import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { CATALOG, DETAILS, slugify } from "./seedData";
import { cleanCopy } from "./lib/copy";

/** One-time import of the starter catalogue. Safe to re-run: does nothing
 *  if categories already exist.  `npx convex run seed:run` */
export const run = internalMutation({
  args: {},
  returns: v.object({ skipped: v.boolean(), products: v.number() }),
  handler: async (ctx) => {
    const existing = await ctx.db.query("categories").take(1);
    if (existing.length > 0) return { skipped: true, products: 0 };

    const productIdBySlug = new Map<string, import("./_generated/dataModel").Id<"products">>();
    let productOrder = 0;

    for (const [ci, cat] of CATALOG.entries()) {
      const categoryId = await ctx.db.insert("categories", {
        slug: cat.id,
        name: cat.name,
        shortName: cat.short,
        tagline: cleanCopy(cat.tagline),
        color: cat.color,
        tint: cat.tint,
        heroShape: cat.hero,
        sortOrder: ci,
        isActive: true,
      });

      for (const [gi, group] of cat.groups.entries()) {
        const groupId = await ctx.db.insert("groups", { categoryId, name: group.name, sortOrder: gi });

        for (const [pi, [name, shape]] of group.items.entries()) {
          const slug = slugify(name);
          let productId = productIdBySlug.get(slug);
          const isPrimary = productId === undefined;

          if (productId === undefined) {
            const d = DETAILS[slug];
            productId = await ctx.db.insert("products", {
              slug,
              name,
              description: cleanCopy(
                d?.desc ??
                `Custom ${name.toLowerCase()} produced in our own studio at Dar Al Najah. Send your artwork or let our designers create it, and we handle print, finishing and delivery across the UAE.`),
              badge: d?.badge ?? null,
              mockupShape: shape,
              imageIds: [],
              isFeatured: Boolean(d),
              isActive: true,
              sortOrder: productOrder++,
            });
            productIdBySlug.set(slug, productId);
          }

          await ctx.db.insert("productGroups", { productId, groupId, isPrimary, sortOrder: pi });
        }
      }
    }
    return { skipped: false, products: productIdBySlug.size };
  },
});
