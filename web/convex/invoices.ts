import { ConvexError, v } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { invoiceCustomer, invoiceItem, invoiceStatus } from "./schema";
import { requireAdmin } from "./lib/admin";
import { round2, text } from "./lib/validate";

/* Simple invoicing for the admin dashboard. Every function is admin-only.
   Totals are always computed here (never trusted from the browser).
   Numbering: drafts have no number. The next number is taken only when an
   invoice is issued (or marked paid straight from draft), and a numbered
   invoice can never return to draft or be deleted, only voided, so the
   sequence of issued invoices never has gaps. */

const DEFAULT_SETTINGS = {
  companyName: "Dar Al Najah Advertising",
  address: "",
  phone: "+971 50 676 2586",
  email: "",
  trn: "",
  bankDetails: "",
  terms: "Payment due within 7 days. Thank you for your business.",
  defaultDueDays: 7,
};

function computeTotals(items: { quantity: number; unitPrice: number }[], discount: number, vatRate: number) {
  const subtotal = round2(items.reduce((a, i) => a + i.quantity * i.unitPrice, 0));
  const taxable = Math.max(0, round2(subtotal - discount));
  const vat = round2((taxable * vatRate) / 100);
  return { subtotal, vat, total: round2(taxable + vat) };
}

/** Takes the next number in the year of the invoice's issue date. */
async function assignNumber(ctx: MutationCtx, issueDate: number) {
  const year = new Date(issueDate).getUTCFullYear();
  return { number: await nextNumber(ctx, year), year };
}

async function nextNumber(ctx: MutationCtx, year: number) {
  const name = `invoice-${year}`;
  const counter = await ctx.db.query("counters").withIndex("by_name", (q) => q.eq("name", name)).unique();
  const value = (counter?.value ?? 0) + 1;
  if (counter) await ctx.db.patch(counter._id, { value });
  else await ctx.db.insert("counters", { name, value });
  return `INV-${year}-${String(value).padStart(4, "0")}`;
}

/* ---------------- settings ---------------- */

export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const s = await ctx.db.query("invoiceSettings").first();
    return s ?? { _id: null, ...DEFAULT_SETTINGS };
  },
});

export const saveSettings = mutation({
  args: {
    companyName: v.string(),
    address: v.string(),
    phone: v.string(),
    email: v.string(),
    trn: v.string(),
    bankDetails: v.string(),
    terms: v.string(),
    defaultDueDays: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, a) => {
    await requireAdmin(ctx);
    if (!Number.isInteger(a.defaultDueDays) || a.defaultDueDays < 0 || a.defaultDueDays > 365)
      throw new ConvexError("Due days must be a whole number between 0 and 365");
    const fields = {
      companyName: text(a.companyName, 120, "Company name") || DEFAULT_SETTINGS.companyName,
      address: text(a.address, 400, "Address"),
      phone: text(a.phone, 60, "Phone"),
      email: text(a.email, 200, "Email"),
      trn: text(a.trn, 30, "TRN"),
      bankDetails: text(a.bankDetails, 600, "Bank details"),
      terms: text(a.terms, 600, "Terms"),
      defaultDueDays: a.defaultDueDays,
    };
    const existing = await ctx.db.query("invoiceSettings").first();
    if (existing) await ctx.db.patch(existing._id, fields);
    else await ctx.db.insert("invoiceSettings", fields);
    return null;
  },
});

/* ---------------- invoices ---------------- */

export const list = query({
  args: { status: v.union(invoiceStatus, v.null()) },
  handler: async (ctx, { status }) => {
    await requireAdmin(ctx);
    const rows = status
      ? await ctx.db.query("invoices").withIndex("by_status", (q) => q.eq("status", status)).order("desc").take(500)
      : await ctx.db.query("invoices").order("desc").take(500);
    return rows.map((i) => ({
      _id: i._id,
      number: i.number,
      status: i.status,
      issueDate: i.issueDate,
      dueDate: i.dueDate,
      customerName: i.customer.company || i.customer.name,
      contactName: i.customer.name,
      phone: i.customer.phone,
      total: i.total,
      itemCount: i.items.length,
    }));
  },
});

export const get = query({
  args: { id: v.id("invoices") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    return await ctx.db.get(id);
  },
});

export const save = mutation({
  args: {
    id: v.union(v.id("invoices"), v.null()),
    status: invoiceStatus,
    issueDate: v.number(),
    dueDate: v.union(v.number(), v.null()),
    customer: invoiceCustomer,
    items: v.array(invoiceItem),
    discount: v.number(),
    vatRate: v.number(),
    notes: v.string(),
  },
  returns: v.object({ id: v.id("invoices"), number: v.union(v.string(), v.null()) }),
  handler: async (ctx, a) => {
    const userId = await requireAdmin(ctx);

    if (!a.customer.name.trim() && !a.customer.company.trim()) throw new ConvexError("Add the customer's name or company");
    if (!a.items.length) throw new ConvexError("Add at least one line item");
    if (a.items.length > 100) throw new ConvexError("Up to 100 line items per invoice");
    if (!Number.isFinite(a.issueDate)) throw new ConvexError("Invalid issue date");
    if (a.dueDate !== null && (!Number.isFinite(a.dueDate) || a.dueDate < a.issueDate - 86400000))
      throw new ConvexError("Due date can't be before the issue date");
    if (![0, 5].includes(a.vatRate)) throw new ConvexError("VAT must be 0% or 5%");

    const items = a.items.map((i, n) => {
      const description = text(i.description, 200, `Line ${n + 1} description`);
      if (!description) throw new ConvexError(`Line ${n + 1} needs a description`);
      if (!Number.isFinite(i.quantity) || i.quantity <= 0 || i.quantity > 1_000_000) throw new ConvexError(`Line ${n + 1}: quantity must be more than 0`);
      if (!Number.isFinite(i.unitPrice) || i.unitPrice < 0 || i.unitPrice > 10_000_000) throw new ConvexError(`Line ${n + 1}: price must be 0 or more`);
      return { productId: i.productId, description, details: text(i.details, 300, `Line ${n + 1} details`), quantity: round2(i.quantity), unitPrice: round2(i.unitPrice) };
    });
    for (const i of items) if (i.productId && !(await ctx.db.get(i.productId))) i.productId = null;

    const discount = round2(a.discount);
    if (!Number.isFinite(discount) || discount < 0) throw new ConvexError("Discount must be 0 or more");
    const totals = computeTotals(items, discount, a.vatRate);
    if (discount > totals.subtotal) throw new ConvexError("Discount can't be more than the subtotal");

    const fields = {
      status: a.status,
      issueDate: a.issueDate,
      dueDate: a.dueDate,
      customer: {
        name: text(a.customer.name, 120, "Customer name"),
        company: text(a.customer.company, 160, "Company"),
        email: text(a.customer.email, 200, "Email"),
        phone: text(a.customer.phone, 60, "Phone"),
        address: text(a.customer.address, 400, "Address"),
        trn: text(a.customer.trn, 30, "Customer TRN"),
      },
      items,
      discount,
      vatRate: a.vatRate,
      notes: text(a.notes, 1000, "Notes"),
      ...totals,
    };

    if (a.status === "void") throw new ConvexError("Use Void on a saved invoice instead");

    if (a.id) {
      const before = await ctx.db.get(a.id);
      if (!before) throw new ConvexError("Invoice not found");
      if (before.status === "void") throw new ConvexError("A void invoice can't be edited");
      if (before.status !== "draft" && a.status === "draft") throw new ConvexError("An issued invoice can't go back to draft");
      // issuing a draft takes the next number
      const numbering = !before.number && a.status !== "draft" ? await assignNumber(ctx, a.issueDate) : null;
      await ctx.db.patch(a.id, { ...fields, ...numbering });
      return { id: a.id, number: numbering?.number ?? before.number };
    }
    const numbering = a.status === "draft" ? { number: null, year: null } : await assignNumber(ctx, a.issueDate);
    const id = await ctx.db.insert("invoices", { ...fields, ...numbering, createdBy: userId });
    return { id, number: numbering.number };
  },
});

export const setStatus = mutation({
  args: { id: v.id("invoices"), status: invoiceStatus },
  returns: v.null(),
  handler: async (ctx, { id, status }) => {
    await requireAdmin(ctx);
    const inv = await ctx.db.get(id);
    if (!inv) throw new ConvexError("Invoice not found");
    if (inv.status === "void" && status !== "void") throw new ConvexError("A void invoice can't be reopened");
    if (status === "draft" && inv.status !== "draft") throw new ConvexError("An issued invoice can't go back to draft");
    if (inv.status === "draft" && status === "void") throw new ConvexError("A draft has no number yet: delete it instead");
    // issuing or paying a draft takes the next number
    const numbering = inv.status === "draft" && !inv.number && status !== "draft" ? await assignNumber(ctx, inv.issueDate) : {};
    await ctx.db.patch(id, { status, ...numbering });
    return null;
  },
});

/** Only drafts (which have no number) can be deleted; issued invoices are voided instead. */
export const remove = mutation({
  args: { id: v.id("invoices") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const inv = await ctx.db.get(id);
    if (!inv) return null;
    if (inv.status !== "draft") throw new ConvexError("Only drafts can be deleted. Mark it as void instead.");
    await ctx.db.delete(id);
    return null;
  },
});

/** Compact product list for the invoice line-item picker. */
export const productPicker = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const products = await ctx.db.query("products").take(1000);
    return products
      .map((p) => ({ _id: p._id, name: p.name, isActive: p.isActive }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },
});
