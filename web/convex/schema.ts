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

export const invoiceStatus = v.union(
  v.literal("draft"),
  v.literal("issued"),
  v.literal("paid"),
  v.literal("void"),
);

export const invoiceCustomer = v.object({
  name: v.string(),
  company: v.string(),
  email: v.string(),
  phone: v.string(),
  address: v.string(),
  trn: v.string(), // customer's UAE tax registration number (optional, may be "")
});

export const invoiceItem = v.object({
  productId: v.union(v.id("products"), v.null()), // null = typed manually
  description: v.string(),
  details: v.string(),
  quantity: v.number(),
  unitPrice: v.number(), // AED, before VAT
});

export default defineSchema({
  // app-owned user rows; usernames/passwords live in the Convex Auth components
  // isAdmin: accounts created through Admin → Team or the CLI bootstrap
  users: defineTable({ isAdmin: v.optional(v.boolean()) }),

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

  invoices: defineTable({
    number: v.string(), // INV-2026-0001
    year: v.number(),
    status: invoiceStatus,
    issueDate: v.number(), // ms
    dueDate: v.union(v.number(), v.null()),
    customer: invoiceCustomer,
    items: v.array(invoiceItem),
    discount: v.number(), // AED off the subtotal
    vatRate: v.number(), // percent, 5 = UAE standard rate
    notes: v.string(),
    // computed on the server on every save
    subtotal: v.number(),
    vat: v.number(),
    total: v.number(),
    quoteId: v.union(v.id("quoteRequests"), v.null()),
    createdBy: v.id("users"),
  })
    .index("by_number", ["number"])
    .index("by_status", ["status"]),

  // sequential invoice numbers per year, incremented inside the same transaction
  counters: defineTable({ name: v.string(), value: v.number() }).index("by_name", ["name"]),

  // single document: company details printed on invoices
  // AI product mockups made in the admin Mockup studio
  mockups: defineTable({
    storageId: v.id("_storage"),
    objectLabel: v.string(),
    text: v.string(),
    placement: v.string(),
    style: v.string(),
    aspect: v.string(),
    extra: v.string(),
    hadObjectImage: v.boolean(),
    hadLogo: v.boolean(),
    model: v.string(),
    createdBy: v.id("users"),
  }),

  invoiceSettings: defineTable({
    companyName: v.string(),
    address: v.string(),
    phone: v.string(),
    email: v.string(),
    trn: v.string(),
    bankDetails: v.string(),
    terms: v.string(),
    defaultDueDays: v.number(),
  }),
});
