import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/* Catalogue model
   categories → groups → (productGroups) → products
   The menu, footer, catalogue and product pages are all derived from these
   tables, so adding/disabling a product updates every place at once. */

export const optionValidator = v.object({
  name: v.string(), // "Paper"
  values: v.array(
    v.object({
      label: v.string(), // "350gsm Matte"
      priceModifier: v.number(), // % added to the tier price, e.g. 8 = +8%
    }),
  ),
});

export const tierValidator = v.object({
  quantity: v.number(),
  price: v.number(), // AED for that quantity before option modifiers
});

export const quoteStatus = v.union(
  v.literal("new"),
  v.literal("quoted"),
  v.literal("won"),
  v.literal("lost"),
);

export default defineSchema({
  // app-owned user rows; usernames/passwords live in the Convex Auth components
  users: defineTable({}),

  quoteRequests: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    company: v.string(),
    message: v.string(),
    interests: v.array(v.string()), // category slugs
    productSlug: v.union(v.string(), v.null()),
    details: v.union(v.string(), v.null()), // chosen options from the product page
    estimate: v.union(v.number(), v.null()),
    status: quoteStatus,
  }).index("by_status", ["status"]),

  categories: defineTable({
    slug: v.string(),
    name: v.string(),
    shortName: v.string(),
    tagline: v.string(),
    color: v.string(),
    tint: v.string(),
    heroShape: v.string(),
    // optional photo shown instead of the illustration
    imageId: v.optional(v.union(v.id("_storage"), v.null())),
    sortOrder: v.number(),
    isActive: v.boolean(),
  })
    .index("by_slug", ["slug"])
    .index("by_isActive_and_sortOrder", ["isActive", "sortOrder"]),

  groups: defineTable({
    categoryId: v.id("categories"),
    name: v.string(),
    sortOrder: v.number(),
  }).index("by_categoryId_and_sortOrder", ["categoryId", "sortOrder"]),

  products: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    basePrice: v.number(), // "from" price shown on cards (AED)
    priceUnit: v.string(), // "100 cards"
    turnaround: v.string(),
    badge: v.union(v.string(), v.null()),
    mockupShape: v.string(), // fallback illustration until photos exist
    imageIds: v.array(v.id("_storage")),
    options: v.array(optionValidator),
    quantityTiers: v.array(tierValidator),
    isFeatured: v.boolean(),
    isActive: v.boolean(),
    sortOrder: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_isActive_and_isFeatured_and_sortOrder", ["isActive", "isFeatured", "sortOrder"]),

  // many-to-many: a product can appear in several menu groups
  productGroups: defineTable({
    productId: v.id("products"),
    groupId: v.id("groups"),
    isPrimary: v.boolean(), // drives breadcrumb + colour
    sortOrder: v.number(),
  })
    .index("by_groupId_and_sortOrder", ["groupId", "sortOrder"])
    .index("by_productId", ["productId"]),
});
