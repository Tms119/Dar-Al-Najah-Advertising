import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/* Catalogue model
   categories → groups → (productGroups) → products
   The menu, footer, catalogue and product pages are all derived from these
   tables, so adding/disabling a product updates every place at once.
   Products carry no pricing: customers enquire on WhatsApp. */

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
    badge: v.union(v.string(), v.null()),
    mockupShape: v.string(), // fallback illustration until photos exist
    imageIds: v.array(v.id("_storage")),
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
    // INV-2026-0001, assigned when the invoice is issued (drafts have none), so
    // issued invoice numbers never have gaps
    number: v.union(v.string(), v.null()),
    year: v.union(v.number(), v.null()),
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
    createdBy: v.id("users"),
  })
    .index("by_number", ["number"])
    .index("by_status", ["status"]),

  // admin sign-in lockout: wrong passwords per account (see convex/auth.ts)
  signInGuards: defineTable({
    userId: v.string(),
    failures: v.number(),
    lastFailureAt: v.number(),
    lockedUntil: v.number(),
  }).index("by_userId", ["userId"]),

  // sequential invoice numbers per year, incremented inside the same transaction
  counters: defineTable({ name: v.string(), value: v.number() }).index("by_name", ["name"]),

  // Access passes for the Mockup Studio site: each pass allows `limit` generations
  studioPasses: defineTable({
    label: v.string(), // who it's for, e.g. customer name
    code: v.string(), // normalised access code (uppercase letters and digits)
    used: v.number(),
    limit: v.number(),
    isActive: v.boolean(),
    createdBy: v.id("users"),
  }).index("by_code", ["code"]),

  // Signed-in Mockup Studio devices. Only a SHA-256 hash of the session key is
  // stored, so the table can't be used to sign in even if it were read.
  studioSessions: defineTable({
    passId: v.id("studioPasses"),
    tokenHash: v.string(),
    expiresAt: v.number(),
  })
    .index("by_tokenHash", ["tokenHash"])
    .index("by_passId", ["passId"]),

  // AI product mockups made in the Mockup Studio
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
    passId: v.id("studioPasses"),
  }).index("by_passId", ["passId"]),

  // single document: company details printed on invoices
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
