import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { CATALOG, DEFAULTS, DETAILS, slugify } from "./seedData";

const QTY_MULT = [1, 2.1, 3.8, 6.9, 12];

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
        tagline: cat.tagline,
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
            const def = DEFAULTS[cat.id];
            const base = d?.price ?? def.price;
            const optionMap = d?.options ?? def.options;
            const qty = d?.qty ?? def.qty;
            productId = await ctx.db.insert("products", {
              slug,
              name,
              description:
                d?.desc ??
                `Custom ${name.toLowerCase()} produced in-house at Dar Al Najah. Send your artwork or let our designers create it — we handle print, finishing and delivery across the UAE.`,
              basePrice: base,
              priceUnit: d?.unit ?? "starting from",
              turnaround: d?.turnaround ?? def.turnaround,
              badge: d?.badge ?? null,
              mockupShape: shape,
              imageIds: [],
              options: Object.entries(optionMap).map(([optName, labels]) => ({
                name: optName,
                values: labels.map((label, i) => ({ label, priceModifier: i * 8 })),
              })),
              quantityTiers: qty.map((quantity, i) => ({
                quantity,
                price: Math.round(base * (QTY_MULT[i] ?? i + 1)),
              })),
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
